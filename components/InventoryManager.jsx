import { useState } from "react";
export default function InventoryManager({ inventory, setInventory }) {
  const [vegOnly, setVegOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const updateInventory = async (id, field, value) => {
    const updated = inventory.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setInventory(updated);
    
    await fetch(`/inventory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value })
    });
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVeg = !vegOnly || item.category === 'vegetarian';
    return matchesSearch && matchesVeg;
  });

  return (
    <div className="inventory-manager">
      <div className="inventory-header">
        <h2>🥬 Vegetarian Inventory Manager</h2>
        <div className="inventory-controls">
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <label className="veg-filter">
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={e => setVegOnly(e.target.checked)}
            />
            Show Vegetarian Only
          </label>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Fresh</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredInventory.map(item => (
            <tr key={item.id} className={item.category === 'non-veg' ? 'non-veg-item' : ''}>
              <td>{item.name}</td>
              <td>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={e => updateInventory(item.id, 'quantity', e.target.value)}
                />
              </td>
              <td>
                <select
                  value={item.unit}
                  onChange={e => updateInventory(item.id, 'unit', e.target.value)}
                >
                  <option>g</option>
                  <option>ml</option>
                  <option>pieces</option>
                </select>
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={item.is_fresh}
                  onChange={e => updateInventory(item.id, 'is_fresh', e.target.checked)}
                />
              </td>
              <td>
                <span className={`type-badge ${item.category}`}>
                  {item.category || 'general'}
                </span>
              </td>
              <td>
                <button 
                  onClick={() => {
                    fetch(`/inventory/${item.id}`, { method: 'DELETE' });
                    setInventory(inventory.filter(i => i.id !== item.id));
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}