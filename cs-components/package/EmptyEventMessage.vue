<template>
 <div class="empty-event-message">
    <h1>What Happens Next?</h1>
    <p>Many thanks for your event details. These will shortly be given to one of our specialist event planners, who will be in touch to try and get a complete understanding of your ideas and requirements, so they can then make some tailor made options for you to view. 
</p>
<p>In the meantime you can check out some of the functionality below or start by personalising the event by giving it a name</p>
 </div>
</template>

<script lang="ts">

</script>

<style lang="scss">

.empty-event-message{
    @include frosted-glass-darker();
   
    width: clamp(300px, 800px, 95%);
    padding:20px;
    margin-bottom: 20px;
    border-radius: 5px;
    p{
        margin-top: 10px;
    }
}
</style>
