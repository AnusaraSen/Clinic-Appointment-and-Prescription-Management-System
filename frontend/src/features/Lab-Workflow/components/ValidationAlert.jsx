import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  X
} from 'lucide-react';

const ValidationAlert = ({ 
  validations = [], 
  formData = {}, 
  showSuccessMessages = false,
  className = "",
  onDismiss = null 
}) => {
  const [dismissedMessages, setDismissedMessages] = useState(new Set());

  // Real-time validation results
  const validationResults = validations.map(validation => {
    const result = validation.validator(formData);
    return {
      ...validation,
      isValid: result.isValid,
      message: result.message,
      severity: result.severity || validation.severity || 'error'
    };
  });

  // Filter out dismissed messages and categorize by severity
  const activeValidations = validationResults.filter(v => 
    !dismissedMessages.has(v.id) && 
    (!v.isValid || (showSuccessMessages && v.isValid))
  );

  const errors = activeValidations.filter(v => !v.isValid && v.severity === 'error');
  const warnings = activeValidations.filter(v => !v.isValid && v.severity === 'warning');
  const infos = activeValidations.filter(v => !v.isValid && v.severity === 'info');
  const successes = showSuccessMessages ? activeValidations.filter(v => v.isValid) : [];

  const handleDismiss = (validationId) => {
    setDismissedMessages(prev => new Set([...prev, validationId]));
    if (onDismiss) {
      onDismiss(validationId);
    }
  };

  // Reset dismissed messages when form data changes significantly
  useEffect(() => {
    setDismissedMessages(new Set());
  }, [JSON.stringify(Object.keys(formData))]);

  if (activeValidations.length === 0) {
    return null;
  }

  const getIcon = (severity, isValid) => {
    if (isValid) return <CheckCircle className="h-4 w-4" />;
    
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getAlertClasses = (severity, isValid) => {
    if (isValid) {
      return 'bg-green-50 border-green-200 text-green-700';
    }
    
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-red-50 border-red-200 text-red-700';
    }
  };

  const renderValidationGroup = (validationGroup, title) => {
    if (validationGroup.length === 0) return null;

    return (
      <div className="mb-3 last:mb-0">
        {title && (
          <div className="text-xs font-medium text-gray-600 mb-1">{title}</div>
        )}
        <div className="space-y-1">
          {validationGroup.map((validation) => (
            <div
              key={validation.id}
              className={`flex items-start gap-2 p-2 rounded-md border text-sm ${getAlertClasses(validation.severity, validation.isValid)}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(validation.severity, validation.isValid)}
              </div>
              <div className="flex-1">
                <div className="font-medium">{validation.field || 'Form'}</div>
                <div className="text-xs opacity-90">{validation.message}</div>
              </div>
              {validation.dismissible !== false && (
                <button
                  onClick={() => handleDismiss(validation.id)}
                  className="flex-shrink-0 p-0.5 rounded hover:bg-black hover:bg-opacity-10"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`validation-alerts mb-4 ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="text-sm font-medium text-gray-900">Form Validation</div>
          <div className="flex items-center gap-3 text-xs">
            {errors.length > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors.length} error{errors.length !== 1 ? 's' : ''}
              </span>
            )}
            {warnings.length > 0 && (
              <span className="flex items-center gap-1 text-yellow-600">
                <AlertTriangle className="h-3 w-3" />
                {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
              </span>
            )}
            {successes.length > 0 && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                {successes.length} valid
              </span>
            )}
          </div>
        </div>

        {renderValidationGroup(errors, errors.length > 0 ? 'Errors' : null)}
        {renderValidationGroup(warnings, warnings.length > 0 ? 'Warnings' : null)}
        {renderValidationGroup(infos, infos.length > 0 ? 'Information' : null)}
        {renderValidationGroup(successes, successes.length > 0 ? 'Valid Fields' : null)}
      </div>
    </div>
  );
};

export default ValidationAlert;