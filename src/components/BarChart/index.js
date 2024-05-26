// Write your code here
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

const BarChartComponent = ({data}) => {
  const chartData = Object.keys(data).map(key => ({
    range: key,
    count: data[key],
  }))

  return (
    <div>
      <h2>Bar Chart</h2>
      <BarChart width={600} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>
    </div>
  )
}

export default BarChartComponent
