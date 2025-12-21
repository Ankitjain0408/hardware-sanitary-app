const ActiveCheckbox = ({ checked, onChange, label = "Active" }) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id="isActive"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
        {label}
      </label>
    </div>
  );
};

export default ActiveCheckbox;
