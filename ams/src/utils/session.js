export const getSavedUser = () => {
  const savedUser = localStorage.getItem('user')
  return savedUser ? JSON.parse(savedUser) : null
}

export const saveUserSession = ({ token, user }) => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export const clearUserSession = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const getSavedTeacher = getSavedUser
export const saveTeacherSession = saveUserSession
export const clearTeacherSession = clearUserSession
