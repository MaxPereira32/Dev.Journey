import { db } from './config'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  addDoc
} from 'firebase/firestore'

// ============ USUÁRIOS ============
export const salvarUsuario = async (usuario) => {
  const userRef = doc(db, 'usuarios', usuario.id)
  await setDoc(userRef, {
    ...usuario,
    criado_em: Timestamp.now(),
    atualizado_em: Timestamp.now()
  })
  return usuario.id
}

export const carregarUsuarioPorEmail = async (email) => {
  const q = query(collection(db, 'usuarios'), where('email', '==', email))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
}

export const carregarUsuarioPorId = async (id) => {
  const docRef = doc(db, 'usuarios', id)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null
  return { id: docSnap.id, ...docSnap.data() }
}

export const atualizarUsuario = async (id, dados) => {
  const userRef = doc(db, 'usuarios', id)
  await updateDoc(userRef, {
    ...dados,
    atualizado_em: Timestamp.now()
  })
}

// ============ DISCIPLINAS ============
export const salvarDisciplina = async (usuarioId, data) => {
  const disciplinaRef = doc(db, 'usuarios', usuarioId, 'disciplinas', data.titulo_materia)
  await setDoc(disciplinaRef, {
    ...data,
    usuario_id: usuarioId,
    criado_em: Timestamp.now(),
    atualizado_em: Timestamp.now(),
    horas_registradas: data.horas_registradas || 0,
    exercicios_resolvidos: data.exercicios_resolvidos || 0,
    etapas: data.etapas || [],
    conteudos_relacionados: data.conteudos_relacionados || [],
    exercicios: data.exercicios || []
  })
  return data.titulo_materia
}

export const listarDisciplinas = async (usuarioId) => {
  const disciplinasRef = collection(db, 'usuarios', usuarioId, 'disciplinas')
  const snapshot = await getDocs(disciplinasRef)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export const atualizarDisciplina = async (usuarioId, titulo, data) => {
  const disciplinaRef = doc(db, 'usuarios', usuarioId, 'disciplinas', titulo)
  await updateDoc(disciplinaRef, {
    ...data,
    atualizado_em: Timestamp.now()
  })
}

export const deletarDisciplina = async (usuarioId, titulo) => {
  const disciplinaRef = doc(db, 'usuarios', usuarioId, 'disciplinas', titulo)
  await deleteDoc(disciplinaRef)
}

// ============ TAREFAS ============
export const salvarTarefa = async (data) => {
  const tarefasRef = collection(db, 'tarefas')
  const docRef = await addDoc(tarefasRef, {
    ...data,
    criado_em: Timestamp.now(),
    atualizado_em: Timestamp.now(),
    status: data.status || 'pendente'
  })
  return docRef.id
}

export const listarTarefas = async (usuarioId, status = null) => {
  let q = query(
    collection(db, 'tarefas'),
    where('usuario_id', '==', usuarioId)
  )
  
  if (status) {
    q = query(q, where('status', '==', status))
  }
  
  const snapshot = await getDocs(q)
  const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  return docs.sort((a, b) => b.criado_em?.seconds - a.criado_em?.seconds)
}

export const atualizarTarefa = async (id, data) => {
  const tarefaRef = doc(db, 'tarefas', id)
  await updateDoc(tarefaRef, {
    ...data,
    atualizado_em: Timestamp.now()
  })
}

export const deletarTarefa = async (id) => {
  const tarefaRef = doc(db, 'tarefas', id)
  await deleteDoc(tarefaRef)
}

// ============ REGISTROS DE ESTUDO ============
export const salvarRegistroEstudo = async (data) => {
  const registrosRef = collection(db, 'registros_estudo')
  const docRef = await addDoc(registrosRef, {
    ...data,
    data: data.data || new Date().toISOString().split('T')[0],
    criado_em: Timestamp.now()
  })
  return docRef.id
}

export const listarRegistrosEstudo = async (usuarioId, periodo = null) => {
  let q = query(
    collection(db, 'registros_estudo'),
    where('usuario_id', '==', usuarioId)
  )
  
  if (periodo === 'semana') {
    const semanaAtras = new Date()
    semanaAtras.setDate(semanaAtras.getDate() - 7)
    q = query(q, where('data', '>=', semanaAtras.toISOString().split('T')[0]))
  }
  
  const snapshot = await getDocs(q)
  const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  return docs.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
}

// ============ TUTORES ============
export const salvarTutor = async (data) => {
  const tutoresRef = collection(db, 'tutores')
  const docRef = await addDoc(tutoresRef, {
    nome: data.nome,
    email: data.email || '',
    telefone: data.telefone || '',
    cargo: data.cargo || '',
    instituicao: data.instituicao || '',
    experiencia: data.experiencia || '',
    cor: data.cor || '#3B82F6',
    usuario_id: data.usuario_id,
    criado_em: Timestamp.now(),
    atualizado_em: Timestamp.now()
  })
  return docRef.id
}

export const listarTutores = async (usuarioId) => {
  const q = query(
    collection(db, 'tutores'),
    where('usuario_id', '==', usuarioId)
  )
  const snapshot = await getDocs(q)
  const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  return docs.sort((a, b) => a.nome.localeCompare(b.nome))
}

export const atualizarTutor = async (id, data) => {
  const tutorRef = doc(db, 'tutores', id)
  await updateDoc(tutorRef, {
    nome: data.nome,
    email: data.email || '',
    telefone: data.telefone || '',
    cargo: data.cargo || '',
    instituicao: data.instituicao || '',
    experiencia: data.experiencia || '',
    cor: data.cor || '#3B82F6',
    atualizado_em: Timestamp.now()
  })
}

export const deletarTutor = async (id) => {
  const tutorRef = doc(db, 'tutores', id)
  await deleteDoc(tutorRef)
}

// ============ MAPA MENTAL ============
export const salvarMapaMental = async (usuarioId, mapaData) => {
  const mapaRef = doc(db, 'usuarios', usuarioId, 'mapa_mental', 'main')
  await setDoc(mapaRef, {
    nodes: mapaData.nodes || [],
    connections: mapaData.connections || [],
    atualizado_em: Timestamp.now()
  })
}

export const obterMapaMental = async (usuarioId) => {
  const mapaRef = doc(db, 'usuarios', usuarioId, 'mapa_mental', 'main')
  const snap = await getDoc(mapaRef)
  if (!snap.exists()) return null
  return snap.data()
}

