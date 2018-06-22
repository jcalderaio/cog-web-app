import { Mappers as DateMappers } from 'visualizations/common/dateControls';


/**
 * Most custom tooltip formmatting can be done with props 
 * on the Tooltip component. i.e. <Tooltip formatter={func} labelFormatter={func} />
 * 
 * formatter: (<value>, <label>) => string
 * labelFormatter: (<label>) => string
 * 
 * example:
 *  <Chart>
 *    <Tooltip {...FormatProps.monthOrYearInt} />
 *  </Chart>
 * 
 * docs: http://recharts.org/#/en-US/api/Tooltip
 */
export const FormatProps = {
  monthOrYearInt: {
    labelFormatter: DateMappers.intToMonthOrYear,
  }
}