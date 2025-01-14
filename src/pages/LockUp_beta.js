import React, { useEffect, useState } from 'react';

import { connect, useSelector, useDispatch } from 'react-redux';
import { useWeb3React } from '@web3-react/core';
import { styled } from '@mui/material/styles';

// ** Import Material UI Components
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
// ** Import Assets
import useStyles from '../assets/styles';
import { TOKENLISTS } from "../redux/constants";

import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { getLocker, getData, withdraw, explorer } from '../web3';
import { explorer_, network_dec_to_hex, network_to_chain } from '../constants';
import { toggleDrawer } from '../components/Header';

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 5,
        backgroundColor: theme.palette.mode === 'light' ? '#1a90ff' : '#308fe8',
    },
}));
const dateTime = async (date) => {
    return date.toLocaleString();
};
const LockUp = (props) => {

    const { lockId, wallet, token } = props.match.params;
    const { account, connector } = useWeb3React();
    const [chainId, setChainId] = useState(0);
    const [amount, setAmount] = useState(0);
    const [_token, set_Token] = useState("");
    const [isWithdrawn, setIsWithdrawn] = useState("");
    const [totalSupply, setTotalSupply] = useState(0);
    const [status_, setStatus_] = useState(false);
    const [unlockAble, setUnlockAble] = useState(false);
    const [claimed, setClaimed] = useState(false);
    const [unlockTimestamp, setUnlockTimestamp] = useState(0);
    const [unlockDate, setUnlockDate] = useState("");
    const [network, setNetwork] = useState("");
    const [holdingContract, setHoldingContract] = useState("");
    const [currentTimestamp, setCurrentTimestamp] = useState(Math.round(Date.now() / 1000));
    const dispatch = useDispatch();
    const data = useSelector(state => state.tokenLists);
    let tokenData = undefined;
    // let tokenDataIndex = data.findIndex(each => each.token.address === token.toLowerCase());
    // if (tokenDataIndex !== -1) tokenData = data[tokenDataIndex];
    if (network) {
        console.log("net: ", account, network_to_chain[network], explorer_[network_dec_to_hex[chainId]]);
    } else {
        // console.log("connector: ",connector);
    };
    const checkLocker = async (provider, lockId, account, network) => {
        return await getLocker(provider, lockId, account, network);
    };
    const setDate = async (utcSeconds) => {
        let d = new Date(0);
        d.setUTCSeconds(utcSeconds);
        return d;
    };
    const epoch = async (date) => {
        return Date.parse(date);
    };
    useEffect(async () => {
        if (!account) {
            toggleDrawer();
        };
        const __dispatch = async (newData) => {
            try {
                dispatch({ type: TOKENLISTS, payload: newData });
            } catch (e) {
                console.log(e);
            };
        };
        const __prepare = async (connector) => {
            try {
                connector.getChainId().then((chainId) => {
                    setChainId(chainId);
                    if (Number(chainId) === 1) setNetwork("Ethereum");
                    if (Number(chainId) === 3) setNetwork("Ropsten");
                    if (Number(chainId) === 5) setNetwork("Goerli");
                    if (Number(chainId) === 56) setNetwork("Binance Smart Chain");
                    if (Number(chainId) === 97) setNetwork("Binance_testnet");
                    if (Number(chainId) === 444) setNetwork("Frenchain_testnet");
                    if (Number(chainId) === 43114) setNetwork("Avalanche");
                    if (Number(chainId) === 43113) setNetwork("Avalanche_testnet");
                    if (Number(chainId) === 44444) setNetwork("Frenchain");
                    if (Number(chainId) === 420420) setNetwork("Kekchain");
                    if (Number(chainId) === 420666) setNetwork("Kekchain_testnet");
                });
            } catch (e) {
                console.log("err: ", e);
            };
        };
        if (lockId) {
            let unlockAbleCheck;
            let lock_props;
            let props_out;
            let timer;
            try {
                timer = setInterval(async () => {
                    const iLock = {
                        "wallet": wallet,
                        "unclaimed": claimed,
                        "unlockTimestamp": unlockTimestamp,
                        "_token": _token,
                        "amount": amount,
                        "holdingContract": holdingContract
                    };
                    if (iLock["_token"] !== '' && iLock["amount"] !== 0 && iLock["holdingContract"] !== '') {
                        setStatus_(true);
                    } else {
                        setStatus_(false);
                    };
                    switch (status_) {
                        case true:
                            clearInterval(timer);
                            break;
                        case false:
                            props_out(lock_props);
                            break;
                        default:
                            break;
                    };
                }, 3000);
                props_out = async (lock_props) => {
                    lock_props = setTimeout(async () => {
                        console.log("unlockAble (p_o): ", unlockAble);
                        try {
                            let provider = await connector.getProvider();
                            getLocker(provider, lockId, account, network).then(async(newData) => {
                                if (newData) {
                                    if (newData[0]["getLock"] !== undefined && newData[0].amount > 0) {
                                        console.log("newData: ", newData[0]["getLock"], newData[0].unlockTimestamp);
                                        await setAmount(newData[0].amount / 10 ** 18);
                                        await set_Token(newData[0].lockerAddress);
                                        await setHoldingContract(newData[0].holdingContract);
                                        await setUnlockTimestamp(parseFloat(newData[0].unlockTimestamp));
                                        await setClaimed(newData[0].unclaimed);
                                        let d = new Date(0);
                                        d.setUTCSeconds(newData[0].unlockTimestamp);
                                        await setUnlockDate(d.toString());
                                        console.log("utcSeconds: ", unlockDate);
                                        unlockAbleCheck = setInterval(async () => {
                                            const dateToday = new Date();
                                            const timestamp = await epoch(dateToday);
                                            setCurrentTimestamp(timestamp);
                                            if (!isNaN(unlockTimestamp) && unlockTimestamp > 0) {
                                                console.log("currentTimestamp: ", timestamp, currentTimestamp);
                                                console.log("unlockDate: ", unlockDate);
                                                console.log("unlockTimestamp: ", unlockTimestamp);
                                                if (isNaN(unlockTimestamp) === true || isNaN(unlockDate) === true || isNaN(timestamp) === true) {
                                                    console.log("!unlockable or !prepared", unlockTimestamp, unlockDate, timestamp);
                                                } else {
                                                    const unlock_Date = await epoch(unlockDate);
                                                    const unlock_Timestamp = await epoch(unlockTimestamp);
                                                    console.log("timestamp: ", timestamp);
                                                    console.log("unlock_Date: ", unlock_Date);
                                                    console.log("unlock_Timestamp: ", unlock_Timestamp);
                                                    console.log("claimable: ", timestamp > unlock_Date);
                                                    try {
                                                        console.log("unlock_able: ", timestamp, unlock_Date, isNaN(unlock_Date), isNaN(timestamp));
                                                        let unlock_able = timestamp > unlock_Date;
                                                        setUnlockAble(unlock_able);
                                                    } catch (e) {
                                                        console.log("err: ", e);
                                                    };
                                                };
                                            } else {
                                                console.log("no unlockDate: ", unlockDate);
                                            }
                                        }, 10000);
                                    };
                                    __dispatch(newData);
                                };
                            });
                        } catch (e) {
                            console.log(e);
                        };
                    }, 120);
                };
            } catch (e) {
                console.log(e)
            };
            if (account) {
                __prepare(connector);
            } else {
                return () => clearInterval(timer);
            };
        };
    }, [unlockAble, account, wallet, lockId, network])

    const classes = useStyles.pools();
    const mobileClasses = useStyles.mobile();
    const isMobile = useMediaQuery('(max-width:600px)');

    const fn = (val, decimal = 4) => {
        if (!isNaN(Number(val))) {
            const trimVal = Number(Number(val).toFixed(decimal));
            const decimalVal = trimVal.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
            return decimalVal;
        } else {
            return Number(0);
        }
    }

    const withdrawToken = async (id) => {
        if (!account) return;
        let provider = await connector.getProvider()
        withdraw(provider, lockId, account, network).then(async (status) => {
            const newData = JSON.parse(JSON.stringify(data));
            if (status) console.log("withdrawed", newData);
            setIsWithdrawn(true);
        })
    }

    const transferOwnership = async (id) => {
        if (!account) return;
        let provider = await connector.getProvider()
        withdraw(lockId, account, network).then(async (status) => {
            const newData = JSON.parse(JSON.stringify(data));
            if (status) console.log("withdrawed", newData);
        })
    }

    const LockedEvent = (props) => {
        const { index, event } = props
        const withdrawDate = new Date(event.timestamp * 1000);
        let isWithdrawable = event.timestamp < currentTimestamp;
        setIsWithdrawn(event.isWithdrawn);
        const lockedTokenAmount = event.amount / Math.pow(10, event.decimals)
        const getTokenSymbol = event.symbol;
        const owner = event.owner;
        const lockedTime = new Date(event.depositEvent.timestamp * 1000);
        const countdownPercent = event.timestamp > currentTimestamp ? Math.ceil((event.timestamp - currentTimestamp) / (event.timestamp - event.depositEvent.timestamp) * 100) : 0;
        const getRemainTime = () => {
            if (event.timestamp < currentTimestamp) return `00D-00H-00M-00S`;
            return `${Math.floor((event.timestamp - currentTimestamp) / 86400)}D-${Math.floor(((event.timestamp - currentTimestamp) % 86400) / 3600)}H-${Math.floor(((event.timestamp - currentTimestamp) % 3600) / 60)}M-${(event.timestamp - currentTimestamp) % 60}S`
        }
        isWithdrawable = true;
        return (
            <Grid 
                container
                direction='row'
                justifyContent='space-between'
                alignItems='center'
                style={{borderBottom:'2px solid #e55370', fontSize: '13px'}}
                >
                    <Grid item  xs={2} sm={2} md={1} style={{textAlign:'center'}}>
                        <img src='/lock.png' style={{width:40}} alt='token image' />
                    </Grid>
                    <Grid item  xs={10} sm={10} md={5}>
                        <p>Lock Tokens - {fn(lockedTokenAmount, 2)} {getTokenSymbol}</p>
                        {!isWithdrawable ? <p><span><button>Locked</button></span> Locked {lockedTime.toDateString()} - unlocks {withdrawDate.toDateString()}</p>: 
                        (!isWithdrawn ? <p><span><button>Withdrawable</button></span> Locked {lockedTime.toDateString()} - unlocks {withdrawDate.toDateString()}</p>:
                        <p><span><button>Withdrawn</button></span> Locked {lockedTime.toDateString()} - unlocks {withdrawDate.toDateString()}</p>)}
                        <p>Owner: {owner}</p>
                    </Grid>

                    <Grid item  xs={12} sm={8} md={3} style={{textAlign:'center'}}>
                        <p >UNLOCK COUNTDOWN</p>
                        <BorderLinearProgress variant='determinate' value={countdownPercent} />
                        <p >{getRemainTime()}</p>
                    </Grid>
                    <Grid item  xs={12} sm={4} md={3} style={{textAlign:'center'}}>
                        {!isWithdrawable? <Link style={{textDecoration: 'none'}} href={`${explorer[network]}/tx/${event.depositEvent.transactionHash}`} target='_blank' rel='noreferrer'>VIEW TX</Link>: (
                            !isWithdrawn ? (account && account.toLowerCase() === owner.toLowerCase() ? <Button onClick={() => withdrawToken(event.id)} >WITHDRAW</Button> : <Link style={{textDecoration: 'none'}} href={`${explorer[network]}/tx/${event.depositEvent.transactionHash}`} target='_blank' rel='noreferrer'>VIEW TX</Link>) :
                            <Link style={{textDecoration: 'none'}} href={`${explorer[network]}/tx/${event.withdrawEvent.transactionHash}`} target='_blank' rel='noreferrer'>VIEW TX</Link>
                        )}
                        
                    </Grid>
                </Grid>
        )
    }

    let lockedTokenAmount = 0,
        lockedLiquidity = [];
    if (tokenData) tokenData.data.map(each => {
        if (!each.isWithdrawn && !each.isLiquidity) lockedTokenAmount += each.amount / Math.pow(10, each.decimals);
        if (!each.isWithdrawn && each.isLiquidity) {
            let index = lockedLiquidity.findIndex(eachLiquidity => eachLiquidity.token0.address === each.token0.address && eachLiquidity.token1.address === each.token1.address);
            if (index !== -1) lockedLiquidity.locked += each.amount * 100 / each.totalSupply;
            else lockedLiquidity.push({ token0: each.token0, token1: each.token1, locked: each.amount * 100 / each.totalSupply });
        }
    })
    return (
        <Container className={classes.root} maxWidth='lg'>
            <Box className={classes.info}>
                <Grid container spacing={3}>
                    <Grid className={isMobile ? `${mobileClasses.root} grid`  : 'grid'} item xs={12} sm={12} md={12} >
                        <Card className='card'>
                            <CardContent>
                                <Typography className='title' color='textSecondary'>
                                    TimeLock Overview
                                </Typography>
                                <br />
                                <Grid 
                                    container
                                    direction='row'
                                    justifyContent='space-between'
                                    alignItems='center'
                                >
                                    <Grid item  xs={6} sm={6} md={6} style={{textAlign:'center'}}>
                                        <span>ERC20 Locked</span>
                                    </Grid>
                                    <Grid item  xs={6} sm={6} md={6} style={{textAlign:'center'}}>
                                    {`${amount}`}
                                    </Grid>
                                </Grid>
                                <Grid 
                                    container
                                    direction='row'
                                    justifyContent='space-between'
                                    alignItems='center'
                                >
                                    <Grid item  xs={6} sm={6} md={6} style={{textAlign:'center'}}>
                                        <span>Unlocks At</span>
                                    </Grid>
                                    <Grid item  xs={6} sm={6} md={6} style={{textAlign:'center'}}>
                                    {`
                                        ${
                                            // eslint-disable-next-line
                                            unlockDate}`}
                                    </Grid>
                                </Grid>
                                <Grid 
                                    container
                                    direction='row'
                                    justifyContent='space-between'
                                    alignItems='center'
                                >
                                    <Grid item  xs={6} sm={6} md={6} style={{textAlign:'center'}}>
                                        <span>ERC20 Contract</span>
                                    </Grid>
                                    <Grid item  xs={6} sm={6} md={6} style={{textAlign:'center'}}>
                                        {`${_token}`}
                                    </Grid>
                                </Grid> 
                                <Grid 
                                    container
                                    direction='row'
                                    justifyContent='space-between'
                                    alignItems='center'
                                >
                                    <Grid item  xs={6} sm={6} md={6} style={{textAlign:'center'}}>
                                        <span>Holding Contract</span>
                                    </Grid>
                                    <Grid item  xs={6} sm={6} md={6} style={{textAlign:'center'}}>
                                        {`${holdingContract}`}
                                    </Grid>
                                </Grid>
                                <br />
                                <Grid 
                                    container
                                    direction='row'
                                    justifyContent='space-between'
                                    alignItems='center'
                                >
                                    <Grid item  xs={12} sm={12} md={12} style={{textAlign:'center'}}>
                                        <span>Lock Status</span>
                                        {
                                            unlockAble == true ? <Alert severity="success" style={{textAlign:'center'}}>Unlockable</Alert> : unlockAble == undefined ? <Alert severity="warning" style={{textAlign:'center'}}>Loading</Alert> : <Alert severity="warning" style={{textAlign:'center'}}>Locked</Alert>
                                        }
                                    </Grid>
                                </Grid>
                                <br />
                                        { !claimed ? <span><br /><br /><Alert severity="warning" style={{textAlign:'center'}}>This iLock has been Claimed</Alert></span> : <Grid item  xs={4} sm={4} md={4} style={{textAlign:'center'}}>
                                                                                     <Button style={{padding:5,margin:5}} onClick={() => withdrawToken(event.id)} >WITHDRAW</Button>
                                                                                     <Button style={{padding:5,margin:5}} onClick={() => transferOwnership(event.id)} >TRANSFER</Button>
                                                                                </Grid>}
                            </CardContent>
                        </Card>
                    </Grid>
                    
                    
                </Grid>
            </Box>
        </Container >
    )
}
// export default Portfolio
const mapStateToProps = state => ({
    statistics: state.statistics,
    walletAddress: state.walletAddress
})

//connect function INJECTS dispatch function as a prop!!
export default connect(mapStateToProps)(LockUp);