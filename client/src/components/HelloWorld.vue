<template>
  <div class="hello">
    <button @click="reverseMessage">Click to crawl site</button>
    <input v-model='message'>
    <p>: {{ reversedText }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HelloWorld',
  data: function() {
    return {
      message: "",
      reversedText: ""
    };
  },
  methods: {
    reverseMessage() {
      // Send a request to our server, including the message in the query string
      axios.get('http://localhost:65500/statuscode?url=' + this.message).then((response) => {
        // Takes the response we received and sets our "reversedText" variable to it
        this.reversedText = response.data;
      }).catch(error => {
        // Handle unexpected exceptions
        throw new Error(error);
      });
    }
  }
}
</script>


