import {PieChart, Pie, Tooltip, Cell} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

const PieChartComponent = ({data}) => {
  const chartData = Object.keys(data).map(key => ({
    id: key,
    name: key,
    value: data[key],
  }))

  return (
    <div>
      <h2>Pie Chart</h2>
      <PieChart width={400} height={400}>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={150}
          fill="#8884d8"
          label
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${entry.id}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  )
}

export default PieChartComponent
