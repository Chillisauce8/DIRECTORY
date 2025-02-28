<template>
  <div class="flex justify-content-center w-full">
    <div class="w-full mx-4" style="max-width: 1200px;">
      <Card>
        <template #title>
          <div class="flex align-items-center justify-content-between mb-4">
            <h2 class="text-2xl font-bold m-0">Auth Test Suite</h2>
            <Tag :value="currentState.message" :severity="currentState.severity" />
          </div>
        </template>

        <template #content>
          <div class="grid">
            <!-- Test Controls Column -->
            <div class="col-12 lg:col-6">
              <div class="flex flex-column gap-3">
                <Button 
                  @click="testRegistration" 
                  :loading="loading.register" 
                  severity="secondary"
                  class="p-3 text-left"
                >
                  <span class="flex align-items-center">
                    <i class="pi pi-user-plus mr-2"></i>
                    <span class="font-bold">1. Test Registration</span>
                  </span>
                </Button>

                <Button 
                  @click="testLogin" 
                  :loading="loading.login" 
                  severity="secondary"
                  class="p-3 text-left"
                >
                  <span class="flex align-items-center">
                    <i class="pi pi-sign-in mr-2"></i>
                    <span class="font-bold">2. Test Login</span>
                  </span>
                </Button>

                <Button 
                  @click="testSession" 
                  :loading="loading.session" 
                  severity="secondary"
                  class="p-3 text-left"
                >
                  <span class="flex align-items-center">
                    <i class="pi pi-check-circle mr-2"></i>
                    <span class="font-bold">3. Test Session</span>
                  </span>
                </Button>

                <Divider />

                <Button 
                  @click="testFullFlow" 
                  :loading="loading.flow" 
                  severity="success"
                  class="p-3 text-left"
                >
                  <span class="flex align-items-center">
                    <i class="pi pi-play mr-2"></i>
                    <span class="font-bold">Run Full Test Flow</span>
                  </span>
                </Button>
              </div>
            </div>

            <!-- Results Column -->
            <div class="col-12 lg:col-6">
              <div v-if="results.length" class="test-results">
                <h3 class="mb-3">Test Results</h3>
                <ScrollPanel style="height: 400px">
                  <Timeline :value="results" class="mt-3">
                    <template #content="{ item }">
                      <Message 
                        :severity="item.success ? 'success' : 'error'"
                        :text="item.message"
                        class="mb-2"
                      />
                    </template>
                    <template #opposite="{ item }">
                      {{ new Date(item.timestamp).toLocaleTimeString() }}
                    </template>
                  </Timeline>
                </ScrollPanel>
              </div>
              <div v-else class="flex align-items-center justify-content-center h-full">
                <Message severity="info" text="No test results yet. Start by running a test." />
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '#imports'

definePageMeta({
  auth: false
})

import { useAuthService } from '~/service/auth/auth.service'

// Replace useState with plugin
const { $setTestUser, $getTestUser } = useNuxtApp()

const auth = useAuth()
const authService = useAuthService()

// Add error handling for auth state
watchEffect(() => {
  const status = auth.status.value
  console.log('Auth status:', status)
  
  if (status === 'authenticated') {
    console.log('Auth session:', auth.session.value)
  }
})

const loading = reactive({
  register: false,
  login: false,
  session: false,
  flow: false
})

// Update the type to include severity
type TestResult = {
  success: boolean;
  message: string;
  timestamp?: Date;
}

const results = ref<TestResult[]>([])

const addResult = (success: boolean, message: string) => {
  results.value.push({ 
    success, 
    message,
    timestamp: new Date()
  })
}

const currentState = reactive({
  message: 'Ready to test',
  severity: 'info'
})

const testRegistration = async () => {
  loading.register = true
  currentState.message = 'Testing registration...'
  currentState.severity = 'warning'
  
  try {
    const { signIn } = useAuth()
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'TestPass123!'
    }
    
    console.log('Attempting registration with:', { ...testUser, password: '[REDACTED]' })
    
    const result = await signIn('credentials', {
      ...testUser,
      redirect: false
    })

    if (result?.error) {
      throw new Error(result.error)
    }

    // Store test user for later use
    $setTestUser(testUser)
    
    addResult(true, '✅ Registration successful')
    currentState.message = 'Registration passed'
    currentState.severity = 'success'
  } catch (error: any) {
    console.error('Registration test error:', error)
    const message = `❌ Registration failed: ${error.message}`
    addResult(false, message)
    currentState.message = message
    currentState.severity = 'danger'
    throw error
  } finally {
    loading.register = false
  }
}

const testLogin = async () => {
  loading.login = true
  currentState.message = 'Testing login...'
  currentState.severity = 'warning'
  
  try {
    const testUser = $getTestUser()
    console.log('Retrieved test user:', testUser)
    
    if (!testUser?.email) {
      const error = new Error('No test user found - please run registration first')
      addResult(false, `❌ ${error.message}`)
      throw error
    }

    console.log('Attempting login with:', { email: testUser.email })
    
    const result = await auth.signIn('credentials', {
      email: testUser.email,
      password: testUser.password,
      redirect: false
    })

    if (result?.error) {
      throw new Error(result.error)
    }

    addResult(true, '✅ Login successful')
    currentState.message = 'Login passed'
    currentState.severity = 'success'
  } catch (error: any) {
    console.error('Login test error:', error)
    currentState.message = error.message
    currentState.severity = 'danger'
    throw error
  } finally {
    loading.login = false
  }
}

const testSession = async () => {
  loading.session = true
  try {
    const session = await auth.getSession()
    addResult(true, `✅ Session check: ${session ? 'Active' : 'None'}`)
  } catch (error: any) {
    addResult(false, `❌ Session check failed: ${error.message}`)
  } finally {
    loading.session = false
  }
}

const testFullFlow = async () => {
  loading.flow = true
  try {
    await testRegistration()
    await testLogin()
    await testSession()
    addResult(true, '✅ Full flow completed')
  } catch (error: any) {
    addResult(false, `❌ Full flow failed: ${error.message}`)
  } finally {
    loading.flow = false
  }
}
</script>

<style scoped>
.test-results {
  height: 100%;
  min-height: 400px;
}

.p-timeline {
  margin: 0;
}

.p-card {
  margin-bottom: 2rem;
}

:deep(.p-message) {
  margin-bottom: 0;
}

:deep(.p-scrollpanel) {
  border-radius: 6px;
  padding: 0.5rem;
}
</style>
