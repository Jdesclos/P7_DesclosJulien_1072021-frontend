import axios from 'axios';
const state = {
    user: null,
    posts: null,
    token: null,
    userId: null,
    profile:null,
    isAdmin:null,
    profilePosts: null
  };
  
const getters = {
    isAuthenticated(state){

      return !!state.token
    },
    isLogin: state => !!state.user, 
    StatePosts: state => state.posts,
    StateUser: state => state.user,
    StateProfile: state => state.profile,
    StateToken: state => state.token,
    StateUserId: state => state.userId,
    StateIsAdmin: state => state.isAdmin, 
    StateProfilePosts: state => state.profilePosts
};

const actions = {
    async Register({dispatch}, form) {
        let response =await axios.post('/api/users/register', form)
        if (response.data){
          let UserForm = {
            email: response.data.email,
            username: response.data.username,
            password:form.password
          }
          await dispatch('LogInFromRegister', UserForm)
        }else {
          console.log('nop')
        }
      },
      async LogInFromRegister({commit}, User) {
        await axios.post('/api/users/login', User)
        .then(function (response) {      
          const token = response.data.token;
          const userId = response.data.userId;
          const isAdmin = response.data.isAdmin;
          commit('setUserId', userId)
          commit('setIsAdmin', isAdmin)
          return commit('setToken', token)
        })
        await commit('setUser', User.username)
      },
      async LogIn({commit}, User) {
        await axios.post('/api/users/login', User)
        .then(function (response) {      
          const token = response.data.token;
          const userId = response.data.userId;
          const isAdmin = response.data.isAdmin;
          commit('setUserId', userId)
          commit('setIsAdmin', isAdmin)
          return commit('setToken', token)
        })
        await commit('setUser', User.get('username'))
      },
      async CreatePost({dispatch}, post) {
        const vuex = JSON.parse(localStorage.getItem('vuex'));
        const token = vuex.auth.token;//on récupère le token stocker en local storage
        const userId = vuex.auth.userId;//on récupère l'userId stocker en local storage
        const formData = new FormData()
        formData.append('image', post.attachment)
        formData.append('content', post.content)
        await axios({
          method:'post',
          url:'/api/home',
          data:formData, userId,
          headers:{'Authorization': `Bearer ${token}` },
        })         
        await dispatch('GetPosts',token)
      },
      async CreateComment({dispatch}, post) {
        const vuex = JSON.parse(localStorage.getItem('vuex'));
        const token = vuex.auth.token;
        const userId = vuex.auth.userId;
        const formData = new FormData();
        formData.append('content', post.content);
        formData.append('messageId', post.messageId);
        await axios({
          method:'post',
          url:'/api/home',
          data:formData, userId,
          headers:{Authorization: `Bearer ${token}`}
        })         
        await dispatch('GetPosts',token)//dispatch appelle une autre fonction à executer
      },
      async GetPosts({ commit }){
        const vuex = JSON.parse(localStorage.getItem('vuex'));
        const token = vuex.auth.token;
        let response = await axios({
          method:'get',
          url:'/api/home',
          headers:{'Authorization': `Bearer ${token}`},
        }) 
        commit('setPosts', response.data);//commit met à jour les states
      },
      async GetProfilePostsById({ commit },userId){
        const vuex = JSON.parse(localStorage.getItem('vuex'));
        const token = vuex.auth.token;
        let response = await axios({
          method:'get',
          url:`/api/profile/messages/${userId}`,
          headers:{'Authorization': `Bearer ${token}`},
        }) 
        commit('setProfilePosts', response.data)

      },
      async GetProfile({ commit }, id){
        const vuex = JSON.parse(localStorage.getItem('vuex'));
        const token = vuex.auth.token;
        const User = vuex.auth.profile.username;
        const userId = vuex.auth.userId;       
        let response = await axios({
          method:'get',
          url:`/api/profile/${id}`,
          headers:{'Authorization': `Bearer ${token}`},
        }) 
        await commit('setProfile', response.data)
        if(userId == vuex.auth.profile.id){
          await commit('setUser',User)
        }
      },
      async GetProfileEdited({commit} ,profileUpdate){
        const vuex = JSON.parse(localStorage.getItem('vuex'));
        const token = vuex.auth.token;
        const userId = vuex.auth.userId;
        const id = profileUpdate.id;
        const User = profileUpdate.username;      
        let response = await axios({
          method:'get',
          url:`/api/profile/${id}`,
          headers:{'Authorization': `Bearer ${token}`},
        })
        response.data.username = User
        await commit('setProfile', response.data)
        if(userId == vuex.auth.profile.id){
          await commit('setUser',User)
        }
      },
      async EditProfile({ dispatch},profileUpdate){
        const vuex = JSON.parse(localStorage.getItem('vuex'));
        const token = vuex.auth.token;
        const formData = new FormData()
        formData.append('profilePicture', profileUpdate.profilePicture)
        formData.append('username', profileUpdate.username)
        formData.append('firstname', profileUpdate.firstname)
        formData.append('lastname', profileUpdate.lastname)
        formData.append('password', profileUpdate.password)
        formData.append('profession', profileUpdate.profession)
        formData.append('bio', profileUpdate.bio)
        await axios({        
            method:'put',
            url:`/api/users/${profileUpdate.id}`,
            headers:{'Authorization': `Bearer ${token}`},
            data: formData,
          })
        await dispatch('GetProfileEdited',profileUpdate);
      },
      async LogOut({commit}){
        let user = null
        commit('logout', user)
      },
      async LikePost({dispatch},sendLike){
        const vuex = JSON.parse(localStorage.getItem('vuex'));
        const token = vuex.auth.token;
        const userId= vuex.auth.userId;
        await axios({
          method:'post',
          url:'/api/home/:id/like',
          data:{sendLike, userId},
          headers:{Authorization: `Bearer ${token}`}
        })  
        await dispatch('GetPosts',token)
      },
      async DeletePost({dispatch}, idMessage)     {
        const vuex = JSON.parse(localStorage.getItem('vuex'));
        const token = vuex.auth.token;
        await axios({
          method:'delete',
          url:'/api/messages/delete',
          data:{idMessage},
          headers:{Authorization: `Bearer ${token}`}
        })
        await dispatch('GetPosts',token)
      },
      async DeleteProfile({dispatch},idUser)     {
        const vuex = JSON.parse(localStorage.getItem('vuex'));
        const token = vuex.auth.token;
        await axios({
          method:'delete',
          url:`/api/users/${idUser}`,
          data:{idUser},
          headers:{Authorization: `Bearer ${token}`}
        })
        await dispatch('LogOut')
      } 
};
const mutations = {
        setUser(state, username){
            state.user = username
        },
        setIsAdmin(state, isAdmin){
          state.isAdmin = isAdmin
      },
        setProfile(state, profile){
          state.profile = profile
      },
        setUserId(state, userId){
          state.userId = userId
        },
        setPosts(state, posts){
            state.posts = posts
        },
        setProfilePosts(state, profilePosts){
          state.profilePosts = profilePosts
        },
        setToken(state, token){
          state.token = token
        },
        logout(state){
            state.user = null
            state.posts = null
            state.token = null
        },
};
export default {
  state,
  getters,
  actions,
  mutations
};
