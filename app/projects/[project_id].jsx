import { StyleSheet, View, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import axios from '../../axios-config'
import AsyncStorage from "@react-native-async-storage/async-storage"
import CustomScreen from '../../components/CustomScreen'
import CustomText from '../../components/CustomText'
import Spacer from '../../components/Spacer'
import CustomButton from '../../components/CustomButton'

const KanbanBoard = () => {
  const router = useRouter();
  const { project_id } = useLocalSearchParams();
  const [project, setProject] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [openMenuId, setOpenMenuId] = useState(null);

  const toggleMenu = useCallback((taskId) => {
    setOpenMenuId(curr => curr === taskId ? null : taskId);
  }, []);

  const closeMenu = useCallback(() => {
    setOpenMenuId(null);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        router.replace('/login');
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (loading) return;

    const fetchData = async () => {
      try {
        const [projectRes, statusesRes, tasksRes] = await Promise.all([
          axios.get(`/projects/${project_id}`),
          axios.get('/statuses/'),
          axios.get('/tasks/')
        ]);
        
        setProject(projectRes.data);
        setStatuses(statusesRes.data);
        
        const categoryId = ((parseInt(project_id) - 1) % 3) + 1;
        const projectTasks = tasksRes.data.filter(
          task => task.categoryId === categoryId
        );
        setTasks(projectTasks);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [loading, project_id]);

  const getTasksByStatus = (statusId) => {
    return tasks.filter(task => task.statusId === statusId);
  };

  const statusDisplayNames = {
    1: 'backlog',
    2: 'to-do',
    3: 'in progress',
    5: 'complete',
  };

  const filteredStatuses = statuses
    .filter(s => [1, 2, 3, 5].includes(s.id))
    .map(s => ({ ...s, displayName: statusDisplayNames[s.id] || s.name }));

  const handleCreateTask = async () => {
    if (!newTask.title || newTask.title.length > 30) {
      Alert.alert('Validation Error', 'Title is required and must be 30 characters or less');
      return;
    }
    if (!newTask.description || newTask.description.length > 255) {
      Alert.alert('Validation Error', 'Description is required and must be 255 characters or less');
      return;
    }

    try {
      const categoryId = ((parseInt(project_id) - 1) % 3) + 1;
      await axios.post('/tasks/', {
        title: newTask.title,
        description: newTask.description,
        status_id: 2,
        category_id: categoryId,
      });
      setShowModal(false);
      setNewTask({ title: '', description: '' });
      const tasksRes = await axios.get('/tasks/');
      const catId = ((parseInt(project_id) - 1) % 3) + 1;
      const projectTasks = tasksRes.data.filter(
        task => task.categoryId === catId
      );
      setTasks(projectTasks);
    } catch (error) {
      console.error('Error creating task:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdateStatus = async (task, newStatusId) => {
    try {
      await axios.put(`/tasks/${task.id}`, {
        title: task.title,
        description: task.description,
        status_id: newStatusId,
        category_id: task.categoryId,
      });
      setOpenMenuId(null);
      const tasksRes = await axios.get('/tasks/');
      const catId = ((parseInt(project_id) - 1) % 3) + 1;
      const projectTasks = tasksRes.data.filter(
        t => t.categoryId === catId
      );
      setTasks(projectTasks);
    } catch (error) {
      console.error('Error updating task:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update task');
    }
  };

  if (loading) {
    return (
      <CustomScreen style={{ justifyContent: 'flex-start' }}>
        <CustomText>Loading...</CustomText>
      </CustomScreen>
    );
  }

  return (
    <CustomScreen style={{ justifyContent: 'flex-start', paddingTop: 40 }}>
      <View style={styles.header}>
        <CustomButton onPress={() => router.back()}>
          <CustomText style={{ color: 'white' }}>Back</CustomText>
        </CustomButton>
        <CustomText title style={{ marginLeft: 16 }}>{project?.name || 'Kanban Board'}</CustomText>
      </View>
      <Spacer height={20} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.boardContainer}>
        {filteredStatuses.map(status => (
          <View key={status.id} style={styles.column}>
            <View style={styles.columnHeader}>
              <View style={styles.columnHeaderContent}>
                <CustomText>{status.displayName}</CustomText>
                {status.id === 2 && (
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => setShowModal(true)}
                  >
                    <Ionicons name="add-circle" size={24} color="#34C759" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.columnContent}>
              {getTasksByStatus(status.id).map(task => (
                <View key={task.id} style={styles.taskCard}>
                  <View style={styles.taskCardHeader}>
                    <CustomText style={{ flex: 1 }}>{task.title}</CustomText>
                    <TouchableOpacity
                      style={styles.menuButton}
                      onPress={() => toggleMenu(task.id)}
                    >
                      <CustomText style={styles.menuButtonText}>⋮</CustomText>
                    </TouchableOpacity>
                  </View>
                  {openMenuId === task.id && (
                    <View style={styles.dropdownMenu}>
                      {filteredStatuses
                        .filter(s => s.id !== status.id)
                        .map(s => (
                          <TouchableOpacity
                            key={s.id}
                            style={styles.menuItem}
                            onPress={() => handleUpdateStatus(task, s.id)}
                          >
                            <CustomText style={styles.menuItemText}>Move to {s.displayName}</CustomText>
                          </TouchableOpacity>
                        ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CustomText title style={{ marginBottom: 16 }}>New Task</CustomText>
            
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={newTask.title}
              onChangeText={text => setNewTask({ ...newTask, title: text })}
            />
            
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Description"
              value={newTask.description}
              onChangeText={text => setNewTask({ ...newTask, description: text })}
              multiline
            />
            
            <View style={styles.modalButtons}>
              <CustomButton 
                onPress={() => setShowModal(false)} 
                style={{ marginRight: 8, backgroundColor: '#666' }}
              >
                <CustomText style={{ color: 'white' }}>Cancel</CustomText>
              </CustomButton>
              <CustomButton onPress={handleCreateTask}>
                <CustomText style={{ color: 'white' }}>Create</CustomText>
              </CustomButton>
            </View>
          </View>
        </View>
      </Modal>
    </CustomScreen>
  )
}

export default KanbanBoard

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  boardContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  column: {
    width: 200,
    marginHorizontal: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    maxHeight: '100%',
  },
  columnHeader: {
    padding: 12,
    backgroundColor: '#d0d0d0',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  columnHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addButton: {
    marginLeft: 8,
  },
  columnContent: {
    padding: 8,
    minHeight: 100,
  },
  taskCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  taskCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  menuButton: {
    padding: 4,
  },
  menuButtonText: {
    fontSize: 18,
    color: '#666',
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  menuItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  menuItemText: {
    fontSize: 12,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
})
