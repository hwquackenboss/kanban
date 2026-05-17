import { StyleSheet, View, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native'
import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import axios from '../axios-config'
import AsyncStorage from "@react-native-async-storage/async-storage"
import CustomScreen from '../components/CustomScreen'
import CustomText from '../components/CustomText'
import Spacer from '../components/Spacer'
import CustomButton from '../components/CustomButton'

const Home = () => {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '' });

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
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/projects/');
        const sorted = [...response.data].sort((a, b) => 
          (a.name || '').localeCompare(b.name || '')
        );
        setProjects(sorted);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, [loading]);

  const handleCreateProject = async () => {
    if (!newProject.name || newProject.name.length > 30) {
      Alert.alert('Validation Error', 'Project name is required and must be 30 characters or less');
      return;
    }

    try {
      await axios.post('/projects/', { project_name: newProject.name });
      setShowModal(false);
      setNewProject({ name: '' });
      const response = await axios.get('/projects/');
      const sorted = [...response.data].sort((a, b) => 
        (a.name || '').localeCompare(b.name || '')
      );
      setProjects(sorted);
    } catch (error) {
      console.error('Error creating project:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create project');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.projectItem}
      onPress={() => router.push(`/projects/${item.id}`)}
    >
      <CustomText>{item.name}</CustomText>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <CustomScreen style={{ justifyContent: 'flex-start' }}>
        <CustomText>Loading...</CustomText>
      </CustomScreen>
    );
  }

  return (
    <CustomScreen style={{ justifyContent: 'flex-start' }}>
      <View style={styles.header}>
        <CustomText title>Projects</CustomText>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addButton}>
            <Ionicons name="add-circle" size={32} color="#34C759" />
          </TouchableOpacity>
        </View>
      </View>
      <Spacer height={20} />
      <FlatList
        data={projects}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        style={styles.list}
      />

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CustomText title style={{ marginBottom: 16 }}>New Project</CustomText>
            
            <TextInput
              style={styles.input}
              placeholder="Project Name"
              value={newProject.name}
              onChangeText={text => setNewProject({ name: text })}
            />
            
            <View style={styles.modalButtons}>
              <CustomButton 
                onPress={() => setShowModal(false)} 
                style={{ marginRight: 8, backgroundColor: '#666' }}
              >
                <CustomText style={{ color: 'white' }}>Cancel</CustomText>
              </CustomButton>
              <CustomButton onPress={handleCreateProject}>
                <CustomText style={{ color: 'white' }}>Create</CustomText>
              </CustomButton>
            </View>
          </View>
        </View>
      </Modal>
    </CustomScreen>
  )
}

export default Home

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    width: '100%',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    marginRight: 8,
  },
  list: {
    width: '100%',
  },
  projectItem: {
    padding: 16,
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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