// Write your code here
import {useState, useEffect} from 'react'
import axios from 'axios'
import Transactions from '../Transactions'
import Statistics from '../Statistics'
import BarChartComponent from '../BarChart'
import PieChartComponent from '../PieChart'

const App = () => {
  const [transactions, setTransactions] = useState([])
  const [statistics, setStatistics] = useState({})
  const [barChart, setBarChart] = useState({})
  const [pieChart, setPieChart] = useState({})
  const [selectedMonth, setSelectedMonth] = useState('January')

  const fetchCombinedData = async month => {
    try {
      const response = await axios.get(
        `http://localhost:3000/combined-data?month=${month}`,
      )
      setTransactions(response.data.transactions)
      setStatistics(response.data.statistics)
      setBarChart(response.data.barChart)
      setPieChart(response.data.pieChart)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    fetchCombinedData(selectedMonth)
  }, [selectedMonth])

  return (
    <div>
      <h1>Transaction Management</h1>
      <label>
        Select Month:
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
        >
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
        </select>
      </label>
      <Statistics data={statistics} />
      <Transactions data={transactions} />
      <BarChartComponent data={barChart} />
      <PieChartComponent data={pieChart} />
    </div>
  )
}

export default App
