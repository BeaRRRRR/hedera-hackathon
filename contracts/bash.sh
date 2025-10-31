WHBAR="0x000000000000000000000000000000000006f89a"
VAULT="0x0000000000000000000000000000000000000000"
USER="0xe79ce187df69fab2efc56a4754a58840b7fb821c"
AMOUNT=102000020  # 1 HBAR = 1 WHBAR = 1 yoHBAR
RPC="https://mainnet.hashio.io/api"
PRIVATE_KEY=""

forge script script/Deploy_YoVault.sol \
    --rpc-url $RPC \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --sender $USER \
    -vvvv \
    --sig "run(string,string,address,address,address,address,uint256,bool)" \
    "Hedera YO Vault" \
    "yoUSDC" \
    $WHBAR \
    $USER \
    0x11D45F0313750544e614DfCEbeee3e0f5A68C3cA \
    0x16b691C1FdA63B32D60bf1269D80a325b6d405C9 \
    0 \
    false