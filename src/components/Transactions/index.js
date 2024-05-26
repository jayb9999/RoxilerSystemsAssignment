// Write your code here

const Transactions = ({data}) => (
  <div>
    <h2>Transactions</h2>
    <ul>
      {data.map(transaction => (
        <li key={transaction.id}>
          {transaction.title} - ${transaction.price}
        </li>
      ))}
    </ul>
  </div>
)

export default Transactions
