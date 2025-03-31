import React, { useState,userData,useEffect,useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Inventory.css'; // Create this CSS file
import './Food.css';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          setUserData(storedUser);
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'items':
        return <ItemsContent />;
      case 'orders':
        return <OrdersContent />;
      case 'reports':
        return <ReportsContent />;
      default:
        return <DashboardContent user={userData}/>;
    }
  };
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading inventory...</p>
      </div>
    );
  }

  if (!userData) {
    navigate('/login');
    return null;
  }

  return (
    <div className="inventory-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">SmartKitchen</div>
        
        <nav className="nav-menu">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <i className="fas fa-tachometer-alt"></i> Dashboard
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            <i className="fas fa-boxes"></i> Inventory Items
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <i className="fas fa-clipboard-list"></i> Orders
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <i className="fas fa-chart-bar"></i> Reports
          </button>
        </nav>
        
        <button className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">{userData.name}</span>
              <span className="user-email">{userData.email}</span>
            </div>
            <div className="avatar">
              {userData.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        <div className="content-area">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// Example content components
const DashboardContent = () => {
  const [items] = useState([
    // Sample data with expiry dates
    { id: 1, name: 'Tomatoes', category: 'Vegetables', quantity: 24, expiry: '2023-12-15', threshold: 10 },
    { id: 2, name: 'Chicken', category: 'Meat', quantity: 15, expiry: '2023-12-10', threshold: 5 },
    { id: 3, name: 'Milk', category: 'Dairy', quantity: 8, expiry: '2023-12-05', threshold: 3 }
  ]);

  const expiringSoon = items.filter(item => {
    const expiryDate = new Date(item.expiry);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 7 && diffDays >= 0;
  });

  const expiredItems = items.filter(item => {
    const expiryDate = new Date(item.expiry);
    const today = new Date();
    return expiryDate < today;
  });

  return (
    <div className="dashboard-content">
      <div className="cards-container">
        <div className="stat-card">
          <h3>Total Items</h3>
          <p>{items.length}</p>
        </div>
        <div className="stat-card warning">
          <h3>Low Stock</h3>
          <p>{items.filter(i => i.quantity <= i.threshold).length}</p>
        </div>
        <div className="stat-card danger">
          <h3>Expiring Soon</h3>
          <p>{expiringSoon.length}</p>
        </div>
        <div className="stat-card critical">
          <h3>Expired</h3>
          <p>{expiredItems.length}</p>
        </div>
      </div>

      {expiringSoon.length > 0 && (
        <div className="alert-section">
          <h3>Items Expiring Soon (≤7 days)</h3>
          <ul>
            {expiringSoon.map(item => (
              <li key={item.id}>
                {item.name} - Expires: {item.expiry} (Qty: {item.quantity})
              </li>
            ))}
          </ul>
        </div>
      )}

      {expiredItems.length > 0 && (
        <div className="alert-section critical">
          <h3>Expired Items</h3>
          <ul>
            {expiredItems.map(item => (
              <li key={item.id}>
                {item.name} - Expired on: {item.expiry} (Qty: {item.quantity})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
const ItemsContent = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: '',
    expiry: '',
    threshold: '',
    image: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/items');
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItems();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewItem({ ...newItem, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', newItem.name);
    formData.append('category', newItem.category);
    formData.append('quantity', newItem.quantity);
    formData.append('expiry', newItem.expiry);
    formData.append('threshold', newItem.threshold);
    if (newItem.image) {
      formData.append('image', newItem.image);
    }

    try {
      const url = editingId 
        ? `http://localhost:5002/api/items/${editingId}`
        : 'http://localhost:5002/api/items';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formData
      });
      
      const data = await response.json();
      if (response.ok) {
        // Refresh items
        const updatedResponse = await fetch('http://localhost:5002/api/items');
        const updatedItems = await updatedResponse.json();
        setItems(updatedItems);
        
        // Reset form
        setNewItem({ name: '', category: '', quantity: '', expiry: '', threshold: '', image: null });
        setPreviewImage(null);
        setEditingId(null);
        setShowForm(false);
      } else {
        alert(data.error || 'Failed to save item');
      }
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`http://localhost:5002/api/items/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          // Refresh items
          const updatedResponse = await fetch('http://localhost:5002/api/items');
          const updatedItems = await updatedResponse.json();
          setItems(updatedItems);
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to delete item');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    }
  };

  const handleEdit = (item) => {
    setNewItem({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      expiry: item.expiry.split('T')[0], // Format date for input
      threshold: item.threshold,
      image: null
    });
    setPreviewImage(item.imageUrl || null);
    setEditingId(item.id);
    setShowForm(true);
  };

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'expired';
    if (diffDays <= 7) return 'expiring-soon';
    return 'good';
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Loading items...</div>;

  return (
    <div className="items-content">
      <h2>Inventory Items</h2>
      <div className="search-add-bar">
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button 
          className="btn-primary" 
          onClick={() => {
            setNewItem({ name: '', category: '', quantity: '', expiry: '', threshold: '', image: null });
            setPreviewImage(null);
            setEditingId(null);
            setShowForm(true);
          }}
        >
          + Add New Item
        </button>
      </div>

      {showForm && (
        <form className="item-form" onSubmit={handleAddItem}>
          <h3>{editingId ? 'Edit Item' : 'Add New Item'}</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Name*</label>
              <input
                type="text"
                name="name"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Category*</label>
              <select
                name="category"
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                required
              >
                <option value="">Select</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Meat">Meat</option>
                <option value="Dairy">Dairy</option>
                <option value="Grains">Grains</option>
                <option value="Condiments">Condiments</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Quantity*</label>
              <input
                type="number"
                name="quantity"
                value={newItem.quantity}
                onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label>Expiry Date*</label>
              <input
                type="date"
                name="expiry"
                value={newItem.expiry}
                onChange={(e) => setNewItem({...newItem, expiry: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Low Stock Threshold*</label>
              <input
                type="number"
                name="threshold"
                value={newItem.threshold}
                onChange={(e) => setNewItem({...newItem, threshold: e.target.value})}
                min="1"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Item Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {previewImage && (
              <div className="image-preview">
                <img src={previewImage} alt="Preview" />
              </div>
            )}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-save">
              {editingId ? 'Update' : 'Save'}
            </button>
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={() => {
                setNewItem({ name: '', category: '', quantity: '', expiry: '', threshold: '', image: null });
                setPreviewImage(null);
                setEditingId(null);
                setShowForm(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <table className="items-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Expiry Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map(item => {
            const status = getExpiryStatus(item.expiry);
            return (
              <tr key={item.id} className={`${item.quantity <= item.threshold ? 'low-stock' : ''} ${status}`}>
                <td>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="item-image" />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.quantity}</td>
                <td>{new Date(item.expiry).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${status}`}>
                    {status === 'expired' ? 'Expired' : 
                     status === 'expiring-soon' ? 'Expiring Soon' : 'Good'}
                  </span>
                  {item.quantity <= item.threshold && <span className="status-badge low">Low Stock</span>}
                </td>
                <td>
                  <button className="action-btn edit" onClick={() => handleEdit(item)}>
                    Edit
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(item.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {filteredItems.length === 0 && (
        <div className="empty-state">
          <p>No inventory items found</p>
          {searchTerm && (
            <button className="btn-clear" onClick={() => setSearchTerm('')}>
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
};



const OrdersContent = () => {
  const [recipeData, setRecipeData] = useState(null);
  const [recipeText, setRecipeText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const eventSourceRef = useRef(null);

  // Fetch inventory items when component mounts
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/items');
        const data = await response.json();
        setInventoryItems(data);
      } catch (err) {
        console.error('Error fetching inventory:', err);
      }
    };
    
    fetchInventory();
  }, []);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!recipeData) return;

    const initializeEventStream = () => {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams(recipeData).toString();
      const url = `http://localhost:5001/recipeStream?${queryParams}`;
      
      eventSourceRef.current = new EventSource(url);

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.action === "close") {
            setIsLoading(false);
            closeEventStream();
          } else if (data.action === "chunk") {
            setRecipeText(prev => prev + data.chunk);
          }
        } catch (err) {
          setError("Error parsing recipe data");
          setIsLoading(false);
          closeEventStream();
        }
      };

      eventSourceRef.current.onerror = () => {
        setError("Connection error. Please try again.");
        setIsLoading(false);
        closeEventStream();
      };
    };

    initializeEventStream();
  }, [recipeData]);

  const closeEventStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const onSubmit = (data) => {
    if (!data.ingredients) {
      setError("Please enter at least one ingredient");
      return;
    }
    setRecipeText('');
    setRecipeData(data);
  };

  // Auto-populate ingredients from inventory
  const suggestFromInventory = () => {
    const availableIngredients = inventoryItems
      .filter(item => item.quantity > 0 && new Date(item.expiry) > new Date())
      .map(item => item.name)
      .join(', ');
    
    return availableIngredients;
  };

  return (
    <div className="orders-content">
      <h2>AI Recipe Recommendations</h2>
      <div className="inventory-suggestion">
        <p>Available ingredients from inventory:</p>
        <button 
          onClick={() => setRecipeData({...recipeData, ingredients: suggestFromInventory()})}
          className="suggestion-btn"
        >
          Use Available Ingredients
        </button>
      </div>

      <div className="recipe-card">
        <div className="form-group">
          <label htmlFor="ingredients">Ingredients</label>
          <input
            id="ingredients"
            type="text"
            placeholder="Enter ingredients"
            value={recipeData?.ingredients || ''}
            onChange={(e) => setRecipeData({...recipeData, ingredients: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label htmlFor="mealType">Meal Type</label>
          <select
            id="mealType"
            value={recipeData?.mealType || ''}
            onChange={(e) => setRecipeData({...recipeData, mealType: e.target.value})}
          >
            <option value="">Select</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Snack">Snack</option>
          </select>
        </div>

        <button
          className="submit-button"
          onClick={() => onSubmit(recipeData || { ingredients: '' })}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Recipe'}
        </button>
      </div>

      <div className="recipe-output">
        {isLoading && !recipeText && (
          <div className="loading">Generating recipe...</div>
        )}
        {error && <div className="error">{error}</div>}
        {recipeText && (
          <div className="recipe-result">
            <h3>Recommended Recipe</h3>
            <pre>{recipeText}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
const ReportsContent = () => <div>Reports Content</div>;

export default Inventory;