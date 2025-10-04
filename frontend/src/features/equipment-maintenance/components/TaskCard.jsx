import React from 'react';import React from 'react';import React from 'react';import React from 'react';

import { 

  MapPin, import { 

  Clock, 

  Eye,  MapPin, import { import { 

  FileText,

  Wrench  Clock, 

} from 'lucide-react';

  Eye,  Calendar,   Calendar, 

/**

 * Task Card Component - Individual maintenance request display with clean styling  FileText,

 * Matches the schedule tab styling for consistency

 */  Wrench  MapPin,   MapPin, 

export const TaskCard = ({ 

  task, } from 'lucide-react';

  onAction, 

  getStatusIcon,   AlertTriangle,   AlertTriangle, 

  getStatusBadge, 

  getPriorityBadge /**

}) => {

  const formatTime = (timeString) => { * Task Card Component - Individual maintenance request display with clean styling  Clock,   Clock, 

    if (!timeString) return 'No time set';

    try { * Matches the schedule tab styling for consistency

      const time = new Date(`2000-01-01T${timeString}`);

      return time.toLocaleTimeString('en-US', { */  CheckCircle,  CheckCircle,

        hour: 'numeric',

        minute: '2-digit',export const TaskCard = ({ 

        hour12: true

      });  task,   Play,  Play,

    } catch {

      return timeString;  onAction, 

    }

  };  getStatusIcon,   Pause,  Pause,



  const getStatusColor = (status) => {  getStatusBadge, 

    switch (status) {

      case 'Open':  getPriorityBadge   Check,  Check,

        return 'bg-blue-100 text-blue-800 border-blue-200';

      case 'In Progress':}) => {

        return 'bg-yellow-100 text-yellow-800 border-yellow-200';

      case 'Completed':  const formatTime = (timeString) => {  Eye,  Eye,

        return 'bg-green-100 text-green-800 border-green-200';

      case 'Cancelled':    if (!timeString) return 'No time set';

        return 'bg-red-100 text-red-800 border-red-200';

      default:    try {  FileText,  FileText,

        return 'bg-gray-100 text-gray-800 border-gray-200';

    }      const time = new Date(`2000-01-01T${timeString}`);

  };

      return time.toLocaleTimeString('en-US', {  Wrench  Wrench

  const getPriorityColor = (priority) => {

    switch (priority?.toLowerCase()) {        hour: 'numeric',

      case 'critical':

        return 'bg-red-100 text-red-800';        minute: '2-digit',} from 'lucide-react';} from 'lucide-react';

      case 'high':

        return 'bg-orange-100 text-orange-800';        hour12: true

      case 'medium':

        return 'bg-yellow-100 text-yellow-800';      });

      case 'low':

        return 'bg-blue-100 text-blue-800';    } catch {

      default:

        return 'bg-gray-100 text-gray-800';      return timeString;/**/**

    }

  };    }



  return (  }; * Task Card Component - Individual maintenance request display with clean styling * Task Card Component - Individual maintenance request display with clean styling

    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">

      <div className="flex items-start justify-between">

        <div className="flex-1">

          {/* Task Title and Info */}  const getStatusColor = (status) => { * Matches the schedule tab styling for consistency * Matches the schedule tab styling for consistency

          <div className="flex items-center space-x-3 mb-2">

            <Wrench className="h-5 w-5 text-gray-500" />    switch (status) {

            <h5 className="text-lg font-medium text-gray-900">

              {task.title || 'Maintenance Request'}      case 'Open': */ */

            </h5>

          </div>        return 'bg-blue-100 text-blue-800 border-blue-200';



          {/* Equipment and Location */}      case 'In Progress':export const TaskCard = ({ export const TaskCard = ({ 

          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">

            <span className="font-medium">        return 'bg-yellow-100 text-yellow-800 border-yellow-200';

              Equipment: {task.equipment?.map(eq => eq.name || eq.id).join(', ') || 'N/A'}

            </span>      case 'Completed':  task,   task, 

            

            {task.equipment?.[0]?.location && (        return 'bg-green-100 text-green-800 border-green-200';

              <div className="flex items-center space-x-1">

                <MapPin className="h-4 w-4" />      case 'Cancelled':  onAction,   onAction, 

                <span>{task.equipment[0].location}</span>

              </div>        return 'bg-red-100 text-red-800 border-red-200';

            )}

          </div>      default:  getStatusIcon,   getStatusIcon, 



          {/* Time and Duration */}        return 'bg-gray-100 text-gray-800 border-gray-200';

          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">

            {task.time && (    }  getStatusBadge,   getStatusBadge, 

              <div className="flex items-center space-x-1">

                <Clock className="h-4 w-4" />  };

                <span>{formatTime(task.time)}</span>

              </div>  getPriorityBadge   getPriorityBadge 

            )}

              const getPriorityColor = (priority) => {

            {task.estimatedHours && (

              <span>Duration: {task.estimatedHours}h</span>    switch (priority?.toLowerCase()) {}) => {}) => {

            )}

          </div>      case 'critical':



          {/* Description */}        return 'bg-red-100 text-red-800';  const formatTime = (timeString) => {  const formatTime = (timeString) => {

          {task.description && (

            <p className="text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-3">      case 'high':

              {task.description}

            </p>        return 'bg-orange-100 text-orange-800';    if (!timeString) return 'No time set';    if (!timeString) return 'No time set';

          )}

        </div>      case 'medium':



        {/* Status and Priority Badges */}        return 'bg-yellow-100 text-yellow-800';    try {    try {

        <div className="flex flex-col items-end space-y-2 ml-4">

          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>      case 'low':

            {task.status}

          </span>        return 'bg-blue-100 text-blue-800';      const time = new Date(`2000-01-01T${timeString}`);      const time = new Date(`2000-01-01T${timeString}`);

          

          {task.priority && (      default:

            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>

              {task.priority}        return 'bg-gray-100 text-gray-800';      return time.toLocaleTimeString('en-US', {      return time.toLocaleTimeString('en-US', {

            </span>

          )}    }



          {task.category && (  };        hour: 'numeric',        hour: 'numeric',

            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">

              {task.category}

            </span>

          )}  return (        minute: '2-digit',        minute: '2-digit',



          <span className="text-xs text-gray-500 font-mono">    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">

            #{task.id || task._id}

          </span>      <div className="flex items-start justify-between">        hour12: true        hour12: true

          

          {/* Action Buttons */}        <div className="flex-1">

          <div className="flex space-x-2 mt-3">

            <button          {/* Task Title and Info */}      });      });

              onClick={() => onAction(task, 'view')}

              className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"          <div className="flex items-center space-x-3 mb-2">

            >

              <Eye className="h-4 w-4 mr-1" />            <Wrench className="h-5 w-5 text-gray-500" />    } catch {    } catch {

              View

            </button>            <h5 className="text-lg font-medium text-gray-900">

            <button

              onClick={() => onAction(task, 'updateStatus')}              {task.title || 'Maintenance Request'}      return timeString;      return timeString;

              className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"

            >            </h5>

              <FileText className="h-4 w-4 mr-1" />

              Update Status          </div>    }    }

            </button>

          </div>

        </div>

      </div>          {/* Equipment and Location */}  };  };

    </div>

  );          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">

};

            <span className="font-medium">

export default TaskCard;
              Equipment: {task.equipment?.map(eq => eq.name || eq.id).join(', ') || 'N/A'}

            </span>  const getStatusColor = (status) => {  const getStatusColor = (status) => {

            

            {task.equipment?.[0]?.location && (    switch (status) {    switch (status) {

              <div className="flex items-center space-x-1">

                <MapPin className="h-4 w-4" />      case 'Open':      case 'Open':

                <span>{task.equipment[0].location}</span>

              </div>        return 'bg-blue-100 text-blue-800 border-blue-200';        return 'bg-blue-100 text-blue-800 border-blue-200';

            )}

          </div>      case 'In Progress':      case 'In Progress':



          {/* Time and Duration */}        return 'bg-yellow-100 text-yellow-800 border-yellow-200';        return 'bg-yellow-100 text-yellow-800 border-yellow-200';

          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">

            {task.time && (      case 'Completed':      case 'Completed':

              <div className="flex items-center space-x-1">

                <Clock className="h-4 w-4" />        return 'bg-green-100 text-green-800 border-green-200';        return 'bg-green-100 text-green-800 border-green-200';

                <span>{formatTime(task.time)}</span>

              </div>      case 'Cancelled':      case 'Cancelled':

            )}

                    return 'bg-red-100 text-red-800 border-red-200';        return 'bg-red-100 text-red-800 border-red-200';

            {task.estimatedHours && (

              <span>Duration: {task.estimatedHours}h</span>      default:      default:

            )}

          </div>        return 'bg-gray-100 text-gray-800 border-gray-200';        return 'bg-gray-100 text-gray-800 border-gray-200';



          {/* Description */}    }    }

          {task.description && (

            <p className="text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-3">  };  };

              {task.description}

            </p>

          )}

        </div>  const getPriorityColor = (priority) => {  const getPriorityColor = (priority) => {



        {/* Status and Priority Badges */}    switch (priority?.toLowerCase()) {    switch (priority?.toLowerCase()) {

        <div className="flex flex-col items-end space-y-2 ml-4">

          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>      case 'critical':      case 'critical':

            {task.status}

          </span>        return 'bg-red-100 text-red-800';        return 'bg-red-100 text-red-800';

          

          {task.priority && (      case 'high':      case 'high':

            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>

              {task.priority}        return 'bg-orange-100 text-orange-800';        return 'bg-orange-100 text-orange-800';

            </span>

          )}      case 'medium':      case 'medium':



          {task.category && (        return 'bg-yellow-100 text-yellow-800';        return 'bg-yellow-100 text-yellow-800';

            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">

              {task.category}      case 'low':      case 'low':

            </span>

          )}        return 'bg-blue-100 text-blue-800';        return 'bg-blue-100 text-blue-800';



          <span className="text-xs text-gray-500 font-mono">      default:      default:

            #{task.id || task._id}

          </span>        return 'bg-gray-100 text-gray-800';        return 'bg-gray-100 text-gray-800';

          

          {/* Action Buttons */}    }    }

          <div className="flex space-x-2 mt-3">

            <button  };  };

              onClick={() => onAction(task, 'view')}

              className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"

            >

              <Eye className="h-4 w-4 mr-1" />  return (  return (

              View

            </button>    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">

            <button

              onClick={() => onAction(task, 'updateStatus')}      <div className="flex items-start justify-between">      <div className="flex items-start justify-between">

              className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"

            >        <div className="flex-1">        <div className="flex-1">

              <FileText className="h-4 w-4 mr-1" />

              Update Status          {/* Task Title and Info */}          {/* Task Title and Info */}

            </button>

          </div>          <div className="flex items-center space-x-3 mb-2">          <div className="flex items-center space-x-3 mb-2">

        </div>

      </div>            <Wrench className="h-5 w-5 text-gray-500" />            <Wrench className="h-5 w-5 text-gray-500" />

    </div>

  );            <h5 className="text-lg font-medium text-gray-900">            <h5 className="text-lg font-medium text-gray-900">

};

              {task.title || 'Maintenance Request'}              {task.title || 'Maintenance Request'}

export default TaskCard;
            </h5>            </h5>

          </div>          </div>



          {/* Equipment and Location */}          {/* Equipment and Location */}

          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">

            <span className="font-medium">            <span className="font-medium">

              Equipment: {task.equipment?.map(eq => eq.name || eq.id).join(', ') || 'N/A'}              Equipment: {task.equipment?.map(eq => eq.name || eq.id).join(', ') || 'N/A'}

            </span>            </span>

                        

            {task.equipment?.[0]?.location && (            {task.equipment?.[0]?.location && (

              <div className="flex items-center space-x-1">              <div className="flex items-center space-x-1">

                <MapPin className="h-4 w-4" />                <MapPin className="h-4 w-4" />

                <span>{task.equipment[0].location}</span>                <span>{task.equipment[0].location}</span>

              </div>              </div>

            )}            )}

          </div>          </div>



          {/* Time and Duration */}          {/* Time and Duration */}

          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">

            {task.time && (            {task.time && (

              <div className="flex items-center space-x-1">              <div className="flex items-center space-x-1">

                <Clock className="h-4 w-4" />                <Clock className="h-4 w-4" />

                <span>{formatTime(task.time)}</span>                <span>{formatTime(task.time)}</span>

              </div>              </div>

            )}            )}

                        

            {task.estimatedHours && (            {task.estimatedHours && (

              <span>Duration: {task.estimatedHours}h</span>              <span>Duration: {task.estimatedHours}h</span>

            )}            )}

          </div>          </div>



          {/* Description */}          {/* Description */}

          {task.description && (          {task.description && (

            <p className="text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-3">            <p className="text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-3">

              {task.description}              {task.description}

            </p>            </p>

          )}          )}

        </div>        </div>



        {/* Status and Priority Badges */}        {/* Status and Priority Badges */}

        <div className="flex flex-col items-end space-y-2 ml-4">        <div className="flex flex-col items-end space-y-2 ml-4">

          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>

            {task.status}            {task.status}

          </span>          </span>

                    

          {task.priority && (          {task.priority && (

            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>

              {task.priority}              {task.priority}

            </span>            </span>

          )}          )}



          {task.category && (          {task.category && (

            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">

              {task.category}              {task.category}

            </span>            </span>

          )}          )}



          <span className="text-xs text-gray-500 font-mono">          <span className="text-xs text-gray-500 font-mono">

            #{task.id || task._id}            #{task.id || task._id}

          </span>          </span>

                    

          {/* Action Buttons */}          {/* Action Buttons */}

          <div className="flex space-x-2 mt-3">          <div className="flex space-x-2 mt-3">

            <button            <button

              onClick={() => onAction(task, 'view')}              onClick={() => onAction(task, 'view')}

              className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"              className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"

            >            >

              <Eye className="h-4 w-4 mr-1" />              <Eye className="h-4 w-4 mr-1" />

              View              View

            </button>            </button>

            <button            <button

              onClick={() => onAction(task, 'updateStatus')}              onClick={() => onAction(task, 'updateStatus')}

              className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"              className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"

            >            >

              <FileText className="h-4 w-4 mr-1" />              <FileText className="h-4 w-4 mr-1" />

              Update Status              Update Status

            </button>            </button>

          </div>          </div>

        </div>        </div>

      </div>      </div>

    </div>    </div>

  );  );

};};



export default TaskCard;export default TaskCard;
  };

  const isOverdue = () => {
    const taskDate = new Date(task.scheduled_date);
    const today = new Date();
    return taskDate < today && !['Completed', 'Cancelled'].includes(task.status);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'No time set';
    try {
      const time = new Date(`2000-01-01T${timeString}`);
      return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  const getMaintenanceTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'preventive':
        return <Calendar className="h-4 w-4" />;
      case 'repair':
        return <Wrench className="h-4 w-4" />;
      case 'inspection':
        return <Eye className="h-4 w-4" />;
      default:
        return <Wrench className="h-4 w-4" />;
    }
  };

  const canStart = ['Scheduled', 'Assigned'].includes(task.status);
  const canComplete = task.status === 'In Progress';
  const canPause = task.status === 'In Progress';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Task Title and Info */}
          <div className="flex items-center space-x-3 mb-2">
            <Wrench className="h-5 w-5 text-gray-500" />
            <h5 className="text-lg font-medium text-gray-900">
              {task.title || 'Maintenance Request'}
            </h5>
          </div>

          {/* Equipment and Location */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <span className="font-medium">
              Equipment: {task.equipment?.map(eq => eq.name || eq.id).join(', ') || 'N/A'}
            </span>
            
            {task.equipment?.[0]?.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{task.equipment[0].location}</span>
              </div>
            )}
          </div>

          {/* Time and Duration */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            {task.time && (
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(task.time)}</span>
              </div>
            )}
            
            {task.estimatedHours && (
              <span>Duration: {task.estimatedHours}h</span>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-3">
              {task.description}
            </p>
          )}
        </div>

        {/* Status and Priority Badges */}
        <div className="flex flex-col items-end space-y-2 ml-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(task.status)}`}>
            {task.status}
          </span>
          
          {task.priority && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(task.priority)}`}>
              {task.priority}
            </span>
          )}

          {task.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {task.category}
            </span>
          )}

          <span className="text-xs text-gray-500 font-mono">
            #{task.id || task._id}
          </span>
          
          {/* Action Buttons */}
          <div className="flex space-x-2 mt-3">
            <button
              onClick={() => onAction(task, 'view')}
              className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </button>
            <button
              onClick={() => onAction(task, 'updateStatus')}
              className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
            >
              <FileText className="h-4 w-4 mr-1" />
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
            
            {task.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{task.location}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 mb-3">
            <span className={getStatusBadge(task.status)}>{task.status}</span>
            
            {task.priority && (
              <span className={getPriorityBadge(task.priority)}>{task.priority}</span>
            )}
            
            {task.maintenance_type && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getMaintenanceTypeIcon(task.maintenance_type)}
                <span>{task.maintenance_type}</span>
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 ml-4">
          {canStart && (
            <button
              onClick={() => onAction(task, 'start')}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              title="Start Task"
            >
              <Play className="h-3 w-3" />
              Start
            </button>
          )}
          
          {canPause && (
            <button
              onClick={() => onAction(task, 'pause')}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
              title="Pause Task"
            >
              <Pause className="h-3 w-3" />
              Pause
            </button>
          )}
          
          {canComplete && (
            <button
              onClick={() => onAction(task, 'complete')}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              title="Complete Task"
            >
              <Check className="h-3 w-3" />
              Complete
            </button>
          )}
          
          <button
            onClick={() => onAction(task, 'updateStatus')}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            title="Update Status"
          >
            <FileText className="h-3 w-3" />
            Update
          </button>
        </div>
      </div>

      {/* Task Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Scheduled:</span>
            <span className={isOverdue() ? 'text-red-600 font-medium' : ''}>
              {formatDate(task.scheduled_date)}
            </span>
          </div>
          
          {task.scheduled_time && (
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Time:</span>
              <span>{formatTime(task.scheduled_time)}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {task.estimated_duration && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-medium">Duration:</span>
              <span>{task.estimated_duration}h</span>
            </div>
          )}
          
          {task.assigned_technician_name && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-medium">Assigned:</span>
              <span>{task.assigned_technician_name}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {task.created_date && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="font-medium">Created:</span>
              <span>{formatDate(task.created_date)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-1">Description:</h4>
          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            {task.description}
          </p>
        </div>
      )}

      {/* Notes */}
      {task.technician_notes && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-1">Technician Notes:</h4>
          <p className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-200">
            {task.technician_notes}
          </p>
        </div>
      )}

      {/* Special Indicators */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {isToday() && (
            <span className="inline-flex items-center space-x-1 text-xs font-medium text-blue-600">
              <Clock className="h-3 w-3" />
              <span>Due Today</span>
            </span>
          )}
          
          {isOverdue() && (
            <span className="inline-flex items-center space-x-1 text-xs font-medium text-red-600">
              <AlertTriangle className="h-3 w-3" />
              <span>Overdue</span>
            </span>
          )}
        </div>

        {/* Task ID */}
        <span className="text-xs text-gray-500 font-mono">
          #{task.id || task._id || task.equipment_id}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;