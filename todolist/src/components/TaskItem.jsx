import { useState, useRef, useEffect } from 'react';

export default function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const editInputRef = useRef(null);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== task.text) {
      onEdit(task.id, trimmed);
    } else {
      setEditText(task.text);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(task.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      {/* Checkbox */}
      <input
        type="checkbox"
        className="task-checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
      />

      {/* Text or Edit Input */}
      {isEditing ? (
        <input
          ref={editInputRef}
          className="task-edit-input"
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
        />
      ) : (
        <span className="task-text" onDoubleClick={() => !task.completed && setIsEditing(true)}>
          {task.text}
        </span>
      )}

      {/* Action Buttons */}
      <div className="task-actions">
        {isEditing ? (
          <>
            <button className="save-btn" onClick={handleSave}>Save</button>
            <button className="cancel-btn" onMouseDown={(e) => e.preventDefault()} onClick={handleCancel}>Cancel</button>
          </>
        ) : (
          <>
            {!task.completed && (
              <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
            )}
            <button className="delete-btn" onClick={() => onDelete(task.id)}>Delete</button>
          </>
        )}
      </div>
    </div>
  );
}
