import { ref, watch } from "vue"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { useRouter } from "vue-router"
import{ api } from "@/lib/api"

const user = ref<User | null>(null)
const isReady = ref(false)
const userProfile = ref<{ fullName: string; profilePictureUrl: string | null } | null>(null)

export const useAuth = () => {
  const router = useRouter()
  const loading = ref(false)
  const error = ref("")

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/api/users/me")
      userProfile.value = response.data
    } catch (err) {
      console.error("Failed to fetch user profile", err)
    }
  }

  // watch user เมื่อเปลี่ยนแปลงให้ fetch profile ใหม่
  watch(user, async (newUser) => {
    if (newUser) {
      await fetchUserProfile()
    } else {
      userProfile.value = null
    }
  })

  const initSession = async () => {
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    isReady.value = true
  }

  initSession()

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
  })

  const register = async (email: string, password: string) => {
    loading.value = true
    error.value = ""
    try {
      const { data, error: err } = await supabase.auth.signUp({ email, password })
      if (err) throw err
      user.value = data.user
      router.push("/")
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const login = async (
    email: string,
    password: string,
    redirectPath: string = "/admin/course",
  ) => {
    loading.value = true
    error.value = ""
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
      user.value = data.user
      router.push(redirectPath)
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    user.value = null
    router.push("/login")
  }

  const getToken = async () => {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  }

  return { user, userProfile, isReady, loading, error, register, login, logout, getToken }
}