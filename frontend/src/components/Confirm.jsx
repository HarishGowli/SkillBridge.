import React from "react";
import "./Confirm.css";

const ConfirmModal = ({ open, message, onConfirm, onCancel }) => {
    if (!open) return null;

    return (
        <div className="confirm-overlay">
            <div className="confirm-modal">
                <h2>Confirmation</h2>
                <p>{message}</p>

                <div className="confirm-actions">
                    <button className="btn-cancel" onClick={onCancel}>Cancel</button>
                    <button className="btn-confirm" onClick={onConfirm}>Yes, Continue</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
