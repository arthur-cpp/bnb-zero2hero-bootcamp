# SignDocument contract

## Компиляция
```console
npx hardhat clean && npx hardhat compile
```

## Деплой контракта

```console
npx hardhat run scripts/deploy.js --network bnbt
```

## Верификация кода контракта на BscScan Testnet

Для использования необходимо указать `BSCSCAN_API_KEY` в файле `.env`
В данном контракте в конструктор передается массив, поэтому деплой чуть сложнее чем обычный.

```console
npx hardhat verify --network bnbt --constructor-args scripts/arguments.js {contractAddress}
```