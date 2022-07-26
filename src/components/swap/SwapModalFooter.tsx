import { Trade, TradeType } from '@pancakeswap/sdk'
import React, { useContext, useMemo, useState } from 'react'
import { Repeat } from 'react-feather'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { Field } from '../../state/swap/actions'
import { TYPE } from '../../theme'
import {
  computeSlippageAdjustedAmounts,
  computeTradePriceBreakdown,
  formatExecutionPrice,
  warningSeverity
} from '../../utils/prices'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import FormattedPriceImpact from './FormattedPriceImpact'
import { StyledBalanceMaxMini, SwapCallbackError } from './styleds'
// import { getRouterContract } from '../../utils'
// import { useActiveWeb3React } from '../../hooks'

export default function SwapModalFooter({
  trade,
  onConfirm,
  allowedSlippage,
  swapErrorMessage,
  disabledConfirm
}: {
  trade: Trade
  allowedSlippage: number
  onConfirm: () => void
  swapErrorMessage: string | undefined
  disabledConfirm: boolean
}) {
  const [showInverted, setShowInverted] = useState<boolean>(false)
  const theme = useContext(ThemeContext)
  // const { account, chainId, library } = useActiveWeb3React()
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    allowedSlippage,
    trade
  ])
  const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const severity = warningSeverity(priceImpactWithoutFee)

  // const [amountBurn, setAmountBurn] = useState(0)
  const amountBurn = 0
  // if (chainId && library && account) {
  //   const router = getRouterContract(chainId, library, account)
  //   const method = router.getAmountBurnTokenFee

  //   const args = [trade?.route?.path[0]?.address, trade.inputAmount.raw.toString()]
  //   method(...args).then((response: number) => {
  //     const decimals = trade?.route?.path[0]?.decimals
  //     setAmountBurn(Number(response) / Number(`1e${decimals}`))
  //   })
  // }

  return (
    <>
      <AutoColumn gap="0px">
        <RowBetween align="center">
          <Text fontWeight={400} fontSize={14} color={theme.text2}>
            Price
          </Text>
          <Text
            fontWeight={500}
            fontSize={14}
            color={theme.text1}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
              textAlign: 'right',
              paddingLeft: '10px'
            }}
          >
            {formatExecutionPrice(trade, showInverted)}
            <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
              <Repeat size={14} />
            </StyledBalanceMaxMini>
          </Text>
        </RowBetween>

        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              {trade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold'}
            </TYPE.black>
            <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
          </RowFixed>
          <RowFixed>
            <TYPE.black fontSize={14}>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? '-'
                : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? '-'}
            </TYPE.black>
            <TYPE.black fontSize={14} marginLeft={'4px'}>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? trade.outputAmount.currency.symbol
                : trade.inputAmount.currency.symbol}
            </TYPE.black>
          </RowFixed>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <TYPE.black color={theme.text2} fontSize={14} fontWeight={400}>
              Price Impact
            </TYPE.black>
            <QuestionHelper text="The difference between the market price and your price due to trade size." />
          </RowFixed>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              Liquidity Provider Fee
            </TYPE.black>
            <QuestionHelper text="A portion of each trade (0.20%) goes to liquidity providers as a protocol incentive." />
          </RowFixed>
          <TYPE.black fontSize={14}>
            {realizedLPFee ? realizedLPFee?.toSignificant(6) + ' ' + trade.inputAmount.currency.symbol : '-'}
          </TYPE.black>
        </RowBetween>
        {amountBurn > 0 && (
          <RowBetween>
            <RowFixed>
              <TYPE.black fontSize={14} fontWeight={400} color={theme.red1}>
                Burn Token Amount
              </TYPE.black>
              <QuestionHelper text="This token will be burned when sold" />
            </RowFixed>
            <TYPE.black fontSize={14} color={theme.red1}>
              {realizedLPFee ? `${amountBurn} ${trade.inputAmount.currency.symbol}` : '-'}
            </TYPE.black>
          </RowBetween>
        )}
      </AutoColumn>

      <AutoRow>
        <ButtonError
          onClick={onConfirm}
          disabled={disabledConfirm}
          error={severity > 2}
          style={{ margin: '10px 0 0 0' }}
          id="confirm-swap-or-send"
        >
          <Text fontSize={20} fontWeight={500}>
            {severity > 2 ? 'Swap Anyway' : 'Confirm Swap'}
          </Text>
        </ButtonError>

        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
      <>
        <AutoRow>
          <iframe
            id="tradingview_25ca0"
            name="tradingview_25ca0"
            title="Financial Chart"
            allowtransparency="true"
            scrolling="no"
            allowFullScreen=""
            style="display: block; width: 100%; height: 1009px;"
            src="https://dextools.io/app/assets/vendors/charting_library/en-tv-chart.7a4f9e33.html#symbol=tMHD%2FUSD%20-%20PAN&amp;interval=1&amp;widgetbar=%7B%22details%22%3Afalse%2C%22watchlist%22%3Afalse%2C%22watchlist_settings%22%3A%7B%22default_symbols%22%3A%5B%5D%7D%7D&amp;timeFrames=%5B%7B%22text%22%3A%225y%22%2C%22resolution%22%3A%221W%22%7D%2C%7B%22text%22%3A%221y%22%2C%22resolution%22%3A%221W%22%7D%2C%7B%22text%22%3A%226m%22%2C%22resolution%22%3A%22120%22%7D%2C%7B%22text%22%3A%223m%22%2C%22resolution%22%3A%2260%22%7D%2C%7B%22text%22%3A%221m%22%2C%22resolution%22%3A%2230%22%7D%2C%7B%22text%22%3A%225d%22%2C%22resolution%22%3A%225%22%7D%2C%7B%22text%22%3A%221d%22%2C%22resolution%22%3A%221%22%7D%5D&amp;locale=en&amp;uid=tradingview_25ca0&amp;clientId=0x6eba6081eba26667ce0a96a070a78618d4d8bbfd-bnb&amp;userId=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0IjoiVTJGc2RHVmtYMSs0Y0J6ZkFGdUR5NzFhSDFhYWpKUVZjQlJZYW1RVlVmcTNCcjEySy9LMjU4OUpjMG1jUEZMMXp2Rm5Tc0cwM2FJakpjVVQ4Ly8xSy9URUY5dkEvWHNUL3pna3o4MnBDOHRFbmkyZVNid1F0ZUNLaFBlelIxWVErNTRoaXF2T0o5SWduVG1BSGlOVFFRcjF2dXhEYkFDcWV2cjQ2SXRqTHd5QXlSYU5hSnZYMk9tTkQ4dXpmSlgvcS9wcUFaZXhNbjRLbWpURnhRazdiWnpNUE1FUUZoTFJrMWVjQXFPY3FEb1B5ZTVLV1V0VXUwOGp3aXd4MXlvQlEvMStySTZJVy9KZGdwdVp1U21GRUxoZEduY3Y3Si9zTHhuY3V0RXowd0ZqNVpFRzVNWWdHK21jRkdMODV0Tmlyc0hna0Y1cmwvZXlyR0ZTTzh5S29RPT0iLCJpYXQiOjE2NTg4MjM0MjMsImV4cCI6MTY1ODgyMzgyM30.CgrWDUK8zE4lheOzj4AvXFlMlp8EGUxk38DIR9S0cAQ&amp;chartsStorageVer=1&amp;customCSS=css%2Fcustom_dext.css%3F2.20.0&amp;debug=false&amp;timezone=Europe%2FRome&amp;theme=Light"
            frameBorder="0"
          ></iframe>
        </AutoRow>
      </>
    </>
  )
}
