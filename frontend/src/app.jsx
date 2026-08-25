import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/expenses";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    date: "",
  });

  // Get expenses from backend
  const fetchExpenses = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Add expense
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.amount) {
      alert("Please enter a title and amount");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          amount: Number(form.amount),
          category: form.category,
          date: form.date || new Date().toISOString().split("T")[0],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add expense");
      }

      const newExpense = await response.json();

      setExpenses((prev) => [newExpense, ...prev]);

      setForm({
        title: "",
        amount: "",
        category: "Food",
        date: "",
      });
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Could not add expense");
    }
  };

  // Delete expense
  const deleteExpense = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }

      setExpenses((prev) =>
        prev.filter((expense) => expense._id !== id && expense.id !== id)
      );
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Could not delete expense");
    }
  };

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Expense Tracker</h1>
          <p>Keep track of your spending</p>
        </div>
      </header>

      <main className="container">
        {/* Summary */}
        <section className="summary">
          <div className="summary-card">
            <div className="summary-icon purple">₹</div>
            <div>
              <span>Total Expenses</span>
              <h2>₹{totalExpenses.toFixed(2)}</h2>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon blue">#</div>
            <div>
              <span>Total Transactions</span>
              <h2>{expenses.length}</h2>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon green">✓</div>
            <div>
              <span>Average Expense</span>
              <h2>
                ₹
                {expenses.length
                  ? (totalExpenses / expenses.length).toFixed(2)
                  : "0.00"}
              </h2>
            </div>
          </div>
        </section>

        {/* Add Expense */}
        <section className="card">
          <div className="card-header">
            <div>
              <h2>Add Expense</h2>
              <p>Record a new expense</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="expense-form">
            <div className="input-group">
              <label>Expense Name</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Groceries"
                value={form.title}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
                <option value="Bills">Bills</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Health">Health</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="input-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="add-button">
              + Add Expense
            </button>
          </form>
        </section>

        {/* Expense List */}
        <section className="card">
          <div className="card-header">
            <div>
              <h2>Recent Expenses</h2>
              <p>Your latest transactions</p>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Loading expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">₹</div>
              <h3>No expenses yet</h3>
              <p>Add your first expense using the form above.</p>
            </div>
          ) : (
            <div className="expense-list">
              {expenses.map((expense) => {
                const expenseId = expense._id || expense.id;

                return (
                  <div className="expense-item" key={expenseId}>
                    <div className="expense-left">
                      <div className="category-icon">
                        {getCategoryIcon(expense.category)}
                      </div>

                      <div>
                        <h3>{expense.title}</h3>
                        <div className="expense-meta">
                          <span>{expense.category}</span>
                          <span>•</span>
                          <span>
                            {expense.date
                              ? new Date(expense.date).toLocaleDateString()
                              : "No date"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="expense-right">
                      <strong>
                        -₹{Number(expense.amount || 0).toFixed(2)}
                      </strong>

                      <button
                        className="delete-button"
                        onClick={() => deleteExpense(expenseId)}
                        title="Delete expense"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function getCategoryIcon(category) {
  const icons = {
    Food: "🍔",
    Transport: "🚗",
    Shopping: "🛍️",
    Bills: "📄",
    Entertainment: "🎮",
    Health: "❤️",
    Other: "💰",
  };

  return icons[category] || "💰";
}

export default App;
