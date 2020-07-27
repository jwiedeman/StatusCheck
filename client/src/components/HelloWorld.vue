<template>
  <div class="hello container">
    <div class=''>
      <button class='btn btn-dark' @click="reverseMessage">Click to crawl site</button>
      <label for="exampleEmailInput">Enter site to crawl</label>
      <input v-model='message'></input>
      <p>Response : {{ reversedText }}</p>
    </div>

    <div>

      <p>Connected : {{ context != '' }}</p>
    </div>
  <div class="search-wrapper">
    <input type="text" v-model="search" placeholder="Search title.."/>
        <label>Search DB:</label>
        <div>
          <ul v-for="entity in filteredList" :key="entity._id" class="list-group accordion">
            <li class="list-group-item">{{entity.name}}  
              <button type='button' class='btn btn-danger'@click='crawlTarget(entity)'> Crawl Target </button> 
              {{entity.pages}}  
            </li>
          </ul>
        </div>
  </div>
    




    <div > DB Management

      <ul v-for="entity in context" :key="entity._id" class="list-group accordion">
        <li class="list-group-item">{{entity.name}}    <button type='button' class='btn btn-danger'@click='deleteEntity(entity)'> Delete </button> 
        </li>
      </ul>

    </div>
    
  </div>


</template>

<script>
import axios from 'axios';

export default {
  name: 'HelloWorld',
  data: function() {
    return {
      search:'',
      message: "",
      reversedText: "",
      context:""
    };
  },
  methods: {
    reverseMessage() {
      axios.post('http://localhost:65500/statuscode', {url:this.message}).then((response) => {
        this.refreshContext() 
        this.reversedText = response.data;
      }).catch(error => {
        throw new Error(error);
      });
    },
    deleteEntity(entity) {
      axios.post('http://localhost:65500/deleteentity', {_id : entity._id}).then((response) => {
        console.log('##')
       this.refreshContext() 
      }).catch(error => {
        throw new Error(error);
      });
    },
    crawlTarget(entity) {
      axios.post('http://localhost:65500/crawltarget', {_id : entity._id}).then((response) => {
         throw new Error(error);
      }).catch(error => {
        throw new Error(error);
      });
    },
    refreshContext() {
      setTimeout(() => { 
        axios.get('http://localhost:65500/getcontext').then((response) => {
        // Takes the response we received and sets our "reversedText" variable to it
        this.context = response.data;
      }).catch(error => {
        throw new Error(error);
       this.context = false
      });
       }, 1000)
                        
      
    },
    
  },
  created() {
     this.refreshContext()
  },
  computed: {
    filteredList() {
      return this.context.filter(post => {
        return post.name.toLowerCase().includes(this.search.toLowerCase())
      })
    }
  }
}
</script>
