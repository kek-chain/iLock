# iLockers by Interchained

Introducing the savings plan that the big banks don't want you to learn about.
No-interest, no puzzles, no games.
The first fully open source, enterprise feature packed locker to drop.

iLockers fill the need to store value for periods of time.
Owners, holders, project leaders could make use of iLockers to lock-up and save token(s) and or fungible coin(s) for a duration of time.

Example:
Project BitcoinPlus wants to lock 1,000,0000 USDC to show locked value and prove project is sustainable.
BitcoinPlus operators interact with iLocker smart contracts, or DApp;

(following along with this example) steps:
1) BitcoinPlus Approves iLocker Factory to transfer 1,000,000 USDC.
2) BitcoinPlus calls to CreateLock(), iLocker Factory deploys a new iLock smart contract, known as a holdingContract, && transfers 1,000,000 USDC to the new holdingContract.
3) BitcoinPlus calls withdraw() to claim deposits after the unlockTime (specified during iLock deployment)