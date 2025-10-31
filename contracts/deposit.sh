#!/bin/bash

# === КОНФИГУРАЦИЯ ===
WHBAR="0x000000000000000000000000000000000006f89a"
VAULT="0xBbC336dFee2C3B378Ad5D9897402431A60E69e10"
USER="0xe79ce187df69fab2efc56a4754a58840b7fb821c"
AMOUNT=660000  # 1 HBAR = 1 WHBAR = 1 yoHBAR
RPC="https://mainnet.hashio.io/api"
PRIVATE_KEY=""

echo "=== HBAR → WHBAR → yoHBAR (hashio.io) ==="

# echo "1. Оборачиваем 1 HBAR → 1 WHBAR..."
# cast send $WHBAR "deposit()" \
#     --value $AMOUNT \
#     --private-key $PRIVATE_KEY \
#     --rpc-url $RPC

echo "2. Одобряем ваулту..."
cast send $WHBAR "approve(address,uint256)" \
    $VAULT $AMOUNT \
    --private-key $PRIVATE_KEY \
    --rpc-url $RPC

echo "3. Депозит в YO Vault..."
cast send $VAULT "deposit(uint256,address)" \
    $AMOUNT $USER \
    --private-key $PRIVATE_KEY \
    --rpc-url $RPC

# echo "4. Баланс yoHBAR:"
cast call $VAULT "balanceOf(address)" $USER --rpc-url $RPC

# echo "Готово! Проверь:"
# echo "   Ваулт: https://hashscan.io/testnet/contract/$VAULT"
# echo "   WHBAR: https://hashscan.io/testnet/contract/$WHBAR"