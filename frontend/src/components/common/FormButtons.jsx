const FormButtons = ({ loading, onCancel, submitLabel = "Save", cancelLabel = "Cancel" }) => {
  return (
    <div className="flex gap-2">
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          {cancelLabel}
        </button>
      )}
    </div>
  );
};

export default FormButtons;
