# Rock/Paper/Scissors Front-end and Smart Contract solution

## Игра

- Игра идет на блокчейне BNB SmartChain Testnet
- Игра предполагает ставки по 0.01 tBNB
- Счет игры ведется для игрока, при выигрыше увеличивается, при проигрыше уменьшается
- Смарт-контракт игры использует ChainLink VRFv2 и есть некоторая задержка при получении выбора смарт-контракта и результата игры, что отображается анимацией
- Ход игры также отображается в консоли веб-разработчика в браузере

## Имплементация
- Решение базируется на фронтенде взятом из https://github.com/yasertarek/rock-paper-scissors
- Собственный смарт-контракт, который был немного переработан чтобы убрать вариант "ничьи"
- Фронтенд был осознан и переработан, чтобы мог работать со смарт-контрактом и анимации шли в нужный момент

## Особое замечание

Подписка на события идет через `contract.on`, а не `contract.queryFilter` поскольку `.queryFilter` это работа с историей, а `.on` подписка на live-события.

Вот код, который за это отвечает и пример как правильно подписываться на события смарт-контракта:

```js
const filter = {
    address: contractAddress,
    topics: [
        ethers.utils.id("PlayerGameResult(address,uint8,uint8)"),
        ethers.utils.hexZeroPad(accounts[0], 32)
    ]
};

contract.on(filter, (address, hostChoice, gameResult, event) => {
    console.log(`Player ${address}, host choice ${hostChoice}, game result : ${gameResult}`);

    onPlayResult(hostChoice, gameResult);
});
```