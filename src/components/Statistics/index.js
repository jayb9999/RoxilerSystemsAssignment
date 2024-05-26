// Write your code here
const Statistics = ({data}) => (
  <div>
    <h2>Statistics</h2>
    <p>Total Sales: ${data.totalSales}</p>
    <p>Total Sold Items: {data.totalSoldItems}</p>
    <p>Total Not Sold Items: {data.totalNotSoldItems}</p>
  </div>
)

export default Statistics
