import { useState, useContext } from 'react';
import { AuthContext } from '../app/providers';

export default function GradeEditor({ 
  performance,
  onUpdate,
  onCancelEdit
}) {
  const [grade, setGrade] = useState(performance.grade);
  const [quarter, setQuarter] = useState(performance.quarter);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { auth } = useContext(AuthContext);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const performanceId = typeof performance.id === 'string' 
        ? parseInt(performance.id, 10) 
        : performance.id;
      if (isNaN(performanceId)) {
        setError('Некорректный ID записи');
        console.error('Ошибка: ID записи некорректен', { 
          originalId: performance.id, 
          parsedId: performanceId 
        });
        setSaving(false);
        return; 
      }
      
      console.log(`Обновление оценки: ID=${performanceId}, тип=${typeof performanceId}`, {
        student_id: performance.student_id,
        subject_id: performance.subject_id,
        grade: Number(grade),
        quarter: Number(quarter)
      });

      const response = await fetch(`http://localhost:5000/api/performances/${performanceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          grade: Number(grade),
          quarter: Number(quarter)
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Ошибка при обновлении оценки');
      }

      if (onUpdate) {
        onUpdate({
          ...performance,
          grade: Number(grade),
          quarter: Number(quarter),
          updated: true
        });
      }
    } catch (err) {
      console.error('Ошибка при сохранении оценки:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grade-editor">
      <div className="inputs">
        <div className="input-group">
          <label>Оценка:</label>
          <input
            type="number"
            min="2"
            max="5"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="grade-input"
            disabled={saving}
          />
        </div>
        <div className="input-group">
          <label>Четверть:</label>
          <input
            type="number"
            min="1"
            max="4"
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            className="quarter-input"
            disabled={saving}
          />
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="actions">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="save-button"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
        <button 
          onClick={onCancelEdit} 
          disabled={saving}
          className="cancel-button"
        >
          Отмена
        </button>
      </div>
      
      <style jsx>{`
        .grade-editor {
          padding: 10px;
          background-color: #f0f8ff;
          border-radius: 5px;
          border: 1px solid #c0d8f0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .inputs {
          display: flex;
          gap: 15px;
          margin-bottom: 10px;
        }
        
        .input-group {
          display: flex;
          flex-direction: column;
        }
        
        label {
          font-size: 12px;
          color: #555;
          margin-bottom: 4px;
        }
        
        .grade-input, .quarter-input {
          width: 60px;
          padding: 8px;
          text-align: center;
          font-size: 16px;
          border: 1px solid #c0d8f0;
          border-radius: 4px;
        }
        
        .actions {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        
        .save-button, .cancel-button {
          padding: 6px 12px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-weight: 600;
        }
        
        .save-button {
          background-color: #0070f3;
          color: white;
        }
        
        .save-button:hover {
          background-color: #0051af;
        }
        
        .cancel-button {
          background-color: #f0f0f0;
          color: #333;
        }
        
        .cancel-button:hover {
          background-color: #e0e0e0;
        }
        
        .error-message {
          color: red;
          font-size: 12px;
          margin: 5px 0;
        }
        
        .save-button:disabled, .cancel-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}