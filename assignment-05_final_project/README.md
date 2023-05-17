# Decentralized Financial Data Supply Oracle System

## Data Acquisition Demo

https://zero2hero-bootcamp-oracles-front.vercel.app/

## Scheme

It can be represented by the following ASCII graphics:

```
                      DataFeed
                         |
     +-------------------+----------------------------+
     |                   |                            |
Aggregator          Aggregator                   Aggregator
     |                   |                            |
     |                   |                            |
Transmitter        Transmitter <== Sequencer     Transmitter 
     |                   |                            |
    ...               +--+--+                        ...
                     /   |   \
                Oracle Oracle Oracle
```

Description of components:

* DataFeed is a proxy for calling Aggregators that stores the symbol code - the address of the Aggregator
* Aggregator - a contract that stores the price history of a particular symbol and allows you to access the latest price (main function)
* Transmitter - a contract that processes and checks incoming prices from Oracles
* Sequencer - an external tool (script) periodically calling the Transmitter to open and close the so-called. rounds
* Oracle - script that listens for the round open event in the Transmitter, extracts the price from the price provider and sends it to the Transmitter


## Additional Information

* to verify oracles, an ECDSA signature is used, which they attach in a transaction with a price
* it checks price deviation from the previous known one, delay of response at the level of timestamp from oracle and timestamp of response transaction
* if the average price of the round (from all oracles that sent the price to the Transmitter) does not differ from the average price of the previous round, then it is not saved in the Aggregator
* all smart contracts are Ownable and allow hot swapping