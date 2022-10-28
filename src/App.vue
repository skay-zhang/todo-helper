<template>
  <div class="hello">{{mode}} mode</div>
</template>

<script>
export default {
  name: "App",
  data: () => ({
    mode: ''
  }),
  methods:{
  },
  created(){
    let search = window.location.search;
    if(search && search.length > 2 && search.indexOf('?') === 0){
      let params = new URLSearchParams(search.substring(1))
      this.mode = params.get('mode')
    }
  }
}
</script>

<style scoped>
.hello{
  justify-content: center;
  align-items: center;
  display: flex;
  height: 300px;
}
</style>
