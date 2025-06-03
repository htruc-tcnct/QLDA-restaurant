import { useState, useEffect } from 'react';
import { Table, Form, Button, Badge, InputGroup, Row, Col, Card } from 'react-bootstrap';
import { 
  FaUsers, 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaToggleOn, 
  FaToggleOff, 
  FaSearch, 
  FaFilter, 
  FaSort
} from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import UserFormModal from '../../components/admin/UserFormModal';

const UserManagementPage = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filters when filter states change
  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, roleFilter, statusFilter, sortField, sortDirection]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...users];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.username.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term) || 
        user.fullName?.toLowerCase().includes(term)
      );
    }

    // Apply role filter
    if (roleFilter) {
      result = result.filter(user => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== '') {
      const isActive = statusFilter === 'active';
      result = result.filter(user => user.isActive === isActive);
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA = a[sortField];
      let valueB = b[sortField];

      // Handle date fields
      if (sortField === 'createdAt') {
        valueA = new Date(valueA);
        valueB = new Date(valueB);
      }

      // Handle string fields
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(result);
  };

  // Handle toggle user status
  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/api/admin/users/${userId}/status`, {
        isActive: !currentStatus,
      });
      
      // Update local state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isActive: !currentStatus } : user
      ));
      
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      await api.delete(`/api/admin/users/${userId}`);
      
      // Update local state
      setUsers(users.filter(user => user._id !== userId));
      
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setModalMode('edit');
    setShowModal(true);
  };

  // Handle add new user
  const handleAddUser = () => {
    setCurrentUser(null);
    setModalMode('add');
    setShowModal(true);
  };

  // Handle bulk selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(user => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (e, userId) => {
    if (e.target.checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.warning('No users selected');
      return;
    }

    try {
      if (action === 'delete') {
        if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
          return;
        }
        
        await api.post('/api/admin/users/bulk-delete', { userIds: selectedUsers });
        setUsers(users.filter(user => !selectedUsers.includes(user._id)));
        toast.success('Users deleted successfully');
      } else if (action === 'activate' || action === 'deactivate') {
        const isActive = action === 'activate';
        await api.post('/api/admin/users/bulk-status', { 
          userIds: selectedUsers,
          isActive
        });
        
        setUsers(users.map(user => 
          selectedUsers.includes(user._id) ? { ...user, isActive } : user
        ));
        
        toast.success(`Users ${isActive ? 'activated' : 'deactivated'} successfully`);
      }
      
      setSelectedUsers([]);
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      toast.error(`Failed to ${action} users`);
    }
  };

  // Handle sort
  const handleSort = (field) => {
    const direction = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);
  };

  // Handle modal save
  const handleUserSaved = (savedUser, isNewUser) => {
    if (isNewUser) {
      setUsers([savedUser, ...users]);
    } else {
      setUsers(users.map(user => 
        user._id === savedUser._id ? savedUser : user
      ));
    }
    setShowModal(false);
    toast.success(`User ${isNewUser ? 'created' : 'updated'} successfully`);
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Role badge color mapping
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'manager': return 'warning';
      case 'staff': return 'info';
      case 'customer': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div className="user-management p-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h3 mb-0 text-gray-800">
              <FaUsers className="me-2 text-primary" />
              User Management
            </h1>
            <Button 
              variant="primary" 
              onClick={handleAddUser}
              className="d-flex align-items-center"
            >
              <FaPlus className="me-2" /> Add New User
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Filters */}
          <Row className="mb-4 g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by name, username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <InputGroup>
                <InputGroup.Text>
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                  <option value="customer">Customer</option>
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={2}>
              <InputGroup>
                <InputGroup.Text>
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={2}>
              <InputGroup>
                <InputGroup.Text>
                  Rows
                </InputGroup.Text>
                <Form.Select 
                  value={usersPerPage}
                  onChange={(e) => setUsersPerPage(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </Form.Select>
              </InputGroup>
            </Col>
            <Col md={2}>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-danger" 
                  onClick={() => handleBulkAction('delete')}
                  disabled={selectedUsers.length === 0}
                >
                  <FaTrashAlt />
                </Button>
                <Button 
                  variant="outline-success" 
                  onClick={() => handleBulkAction('activate')}
                  disabled={selectedUsers.length === 0}
                >
                  <FaToggleOn />
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => handleBulkAction('deactivate')}
                  disabled={selectedUsers.length === 0}
                >
                  <FaToggleOff />
                </Button>
              </div>
            </Col>
          </Row>
          
          {/* Users Table */}
          <div className="table-responsive">
            <Table striped hover className="align-middle">
              <thead>
                <tr>
                  <th>
                    <Form.Check 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    />
                  </th>
                  <th onClick={() => handleSort('username')} className="user-select-none">
                    Username {sortField === 'username' && (
                      <FaSort className={`ms-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </th>
                  <th onClick={() => handleSort('email')} className="user-select-none">
                    Email {sortField === 'email' && (
                      <FaSort className={`ms-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </th>
                  <th onClick={() => handleSort('fullName')} className="user-select-none">
                    Full Name {sortField === 'fullName' && (
                      <FaSort className={`ms-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </th>
                  <th onClick={() => handleSort('role')} className="user-select-none">
                    Role {sortField === 'role' && (
                      <FaSort className={`ms-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </th>
                  <th onClick={() => handleSort('isActive')} className="user-select-none">
                    Status {sortField === 'isActive' && (
                      <FaSort className={`ms-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </th>
                  <th onClick={() => handleSort('createdAt')} className="user-select-none">
                    Created At {sortField === 'createdAt' && (
                      <FaSort className={`ms-1 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      No users found
                    </td>
                  </tr>
                ) : (
                  currentUsers.map(user => (
                    <tr key={user._id}>
                      <td>
                        <Form.Check 
                          type="checkbox" 
                          onChange={(e) => handleSelectUser(e, user._id)}
                          checked={selectedUsers.includes(user._id)}
                        />
                      </td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.fullName}</td>
                      <td>
                        <Badge bg={getRoleBadgeColor(user.role)} className="text-capitalize">
                          {user.role}
                        </Badge>
                      </td>
                      <td>
                        {user.isActive ? (
                          <Badge bg="success" className="d-flex align-items-center w-75">
                            <FaToggleOn className="me-1" /> Active
                          </Badge>
                        ) : (
                          <Badge bg="secondary" className="d-flex align-items-center w-75">
                            <FaToggleOff className="me-1" /> Inactive
                          </Badge>
                        )}
                      </td>
                      <td>
                        {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant={user.isActive ? "outline-secondary" : "outline-success"}
                            size="sm"
                            onClick={() => handleToggleStatus(user._id, user.isActive)}
                          >
                            {user.isActive ? <FaToggleOff /> : <FaToggleOn />}
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <FaTrashAlt />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
          
          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(1)}
                  >
                    First
                  </button>
                </li>
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </button>
                </li>
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  // Create a window of 5 pages around the current page
                  let pageNum = currentPage - 2 + index;
                  if (pageNum < 1) pageNum = 1 + index;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - index);
                  
                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <li 
                        key={pageNum} 
                        className={`page-item ${currentPage === pageNum ? 'active' : ''}`}
                      >
                        <button 
                          className="page-link" 
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  }
                  return null;
                })}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </button>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    Last
                  </button>
                </li>
              </ul>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* User Form Modal */}
      <UserFormModal 
        show={showModal}
        handleClose={() => setShowModal(false)}
        mode={modalMode}
        user={currentUser}
        onUserSaved={handleUserSaved}
      />
    </div>
  );
};

export default UserManagementPage; 