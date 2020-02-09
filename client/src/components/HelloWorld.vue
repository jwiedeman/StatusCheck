<template>
  <div class="hello">

    <button @click="reverseMessage">C L I C K</button>
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
      axios.get('http://73.240.171.135:65500/message?message=' + this.message).then((response) => {
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


