import { ZkMeWidget, type Provider } from '@zkmelabs/widget';
import '@zkmelabs/widget/dist/style.css';
import { zkMeConfig } from '@/config/zkMeConfig';
import { API_ENDPOINTS } from '@/constants/api';

export interface KycResults {
    isGrant: boolean;
    associatedAccount: string;
}

async function fetchNewToken(): Promise<string> {
    try {
        const apiKey = import.meta.env.VITE_API_KEY;
        if (!apiKey)
            throw new Error(
                'VITE_X_API_KEY (or VITE_API_KEY) not found in environment variables'
            );

        const response = await fetch(API_ENDPOINTS.ZK_ME_ACCESS_TOKEN, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        return data.accessToken;
    } catch (error) {
        console.error('Failed to fetch new token:', error);
        throw error;
    }
}

let privyWalletAddress: string | null = null;

export function setPrivyWalletAddress(address: string | null) {
    privyWalletAddress = address;
}

async function connect(): Promise<string> {
    if (privyWalletAddress) {
        console.log('Using Privy wallet address:', privyWalletAddress);
        return privyWalletAddress;
    }

    if (typeof window !== 'undefined' && (window).ethereum) {
        try {
            const accounts = (await (window).ethereum.request({
                method: 'eth_requestAccounts',
            })) as string[];
            const address = accounts?.[0];
            if (!address) throw new Error('No accounts returned by provider');
            console.log('Using MetaMask wallet address:', address);
            return address;
        } catch (error) {
            console.error('MetaMask connection failed:', error);
            throw new Error('Failed to connect MetaMask wallet');
        }
    }
    throw new Error('No connected wallet available');
}

const provider: Provider = {
    async getAccessToken() {
        return fetchNewToken();
    },
    async getUserAccounts() {
        try {
            const userConnectedAddress = await connect();
            console.log(
                '[zkMeService] getUserAccounts →',
                userConnectedAddress
            );
            return [userConnectedAddress];
        } catch {
            console.log('[zkMeService] getUserAccounts → no connected wallet');
            return [];
        }
    },
    async delegateTransaction(tx: unknown) {
        console.log('EVM transaction delegation called:', tx);
        return '0x' + Math.random().toString(16).substring(2, 66);
    },
    async delegateCosmosTransaction(tx: unknown) {
        console.log('Cosmos transaction delegation called:', tx);
        throw new Error('Cosmos transaction delegation not implemented');
    },
    async delegateAptosTransaction(tx: unknown) {
        console.log('Aptos transaction delegation called:', tx);
        throw new Error('Aptos transaction delegation not implemented');
    },
    async delegateTonTransaction(tx: unknown) {
        console.log('TON transaction delegation called:', tx);
        throw new Error('TON transaction delegation not implemented');
    },
    async delegateSolanaTransaction({ message }: { message: string }) {
        console.log('Solana transaction delegation called:', message);
        throw new Error('Solana transaction delegation not implemented');
    },
};

export const zkMeWidget = new ZkMeWidget(
    zkMeConfig.appId,
    zkMeConfig.dappName,
    zkMeConfig.chainId,
    provider,
    {
        lv: 'zkKYC',
        programNo: zkMeConfig.programNo,
        theme: 'auto',
        locale: 'en',
    }
);

function handleFinished(results: KycResults) {
    zkMeService.handleKycComplete(results);
}

zkMeWidget.on('kycFinished', handleFinished);
type ZkMeWidgetWithEvents = ZkMeWidget & {
    on: (event: string, callback: () => void) => void;
};


export class ZkMeService {
    private widget: ZkMeWidget;
    private userAddress: string = '';
    private onKycComplete?: (results: KycResults) => void;
    private isOpenFlag: boolean = false;
    private onWidgetClosed?: () => void;

    constructor() {
        this.widget = zkMeWidget;
        // Subscribe to widget lifecycle to detect closing from UI
        try {
            // const w = this.widget;
            // if (typeof (w as any).on === 'function') {
            //     w.on('close', () => {
            //         this.isOpenFlag = false;
            //         document.body.classList.remove('zkme-widget-open');
            //         if (this.onWidgetClosed) this.onWidgetClosed();
            //     });
            //     w.on('hide', () => {
            //         this.isOpenFlag = false;
            //         document.body.classList.remove('zkme-widget-open');
            //         if (this.onWidgetClosed) this.onWidgetClosed();
            //     });
            //     w.on('error', () => {
            //         this.isOpenFlag = false;
            //         document.body.classList.remove('zkme-widget-open');
            //         if (this.onWidgetClosed) this.onWidgetClosed();
            //     });
                const w = this.widget as ZkMeWidgetWithEvents;

                ['close', 'hide', 'error'].forEach((event) => {
                w.on(event, () => {
                    this.isOpenFlag = false;
                    document.body.classList.remove('zkme-widget-open');
                    if (this.onWidgetClosed) this.onWidgetClosed();
                })
            });
        } catch(err) {
            console.error(err);
        }
    }

    setUserAddress(address: string) {
        this.userAddress = address;
        (
            globalThis as typeof globalThis & { userConnectedAddress?: string }
        ).userConnectedAddress = address;
    }

    onKycFinished(callback: (results: KycResults) => void) {
        this.onKycComplete = callback;
    }

    // Allow UI to subscribe to widget close event
    onClosed(callback: () => void) {
        this.onWidgetClosed = callback;
    }

    launch() {
        this.isOpenFlag = true;
        document.body.classList.add('zkme-widget-open');
        this.widget.launch();
    }

    open() {
        this.launch();
    }

    close() {
        const widgetWithMethods = this.widget as ZkMeWidget & {
            hide?: () => void;
            close?: () => void;
        };
        if (widgetWithMethods.hide) widgetWithMethods.hide();
        else if (widgetWithMethods.close) widgetWithMethods.close();
        this.isOpenFlag = false;
        document.body.classList.remove('zkme-widget-open');
        // Notify UI the widget got closed
        if (this.onWidgetClosed) this.onWidgetClosed();
    }

    isOpen(): boolean {
        return this.isOpenFlag;
    }

    getWidget(): ZkMeWidget {
        return this.widget;
    }

    getUserAddress(): string {
        return this.userAddress;
    }

    handleKycComplete(results: KycResults) {
        if (this.onKycComplete) this.onKycComplete(results);
        this.isOpenFlag = false;
        // When finishing KYC, widget typically closes; notify UI defensively
        if (this.onWidgetClosed) this.onWidgetClosed();
    }
}

export const zkMeService = new ZkMeService();
