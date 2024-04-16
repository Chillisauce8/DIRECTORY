<template>
  <article class="review" itemprop="review" itemscope itemtype="https://schema.org/Review">
    <div itemscope itemprop="author" itemtype="http://schema.org/Person">
      <div class="name" itemprop="name">{{review.reviewerName}}</div>
    </div>
    <div class="date" itemprop="datePublished">{{dateHelper.viewDateFormat(dateHelper.parseSaveDateFormat(review.reviewDate))}}</div>
    <div class="rating">
      <TrustPilotStarRating :stars="review.score" v-if="trustpilot"/>
      <StarRating :stars="review.score" v-else/>
    </div>
    <div class="rating-text-wrapper" itemtype="https://schema.org/Rating" itemscope>
      <div class="rating-text" itemprop="reviewRating" >{{review.score}}</div><div>/</div><div class="out-off">5</div>
    </div>
    <div class="title" itemprop="name">{{review.title}}</div>
    <div class="text" itemprop="reviewBody" v-html="review.comment"></div>
  </article>
</template>

<script>


import {useDateHelper} from "~/services/helpers/date-helper.factory";

export default {
  props: ['review', 'trustpilot'],
  setup() {
    return {
      dateHelper: useDateHelper(),
    }
  }
}
</script>

<style lang="scss">

.review {
  text-align: center;
  width: 260px;
  margin: 20px;
  & .name {
    font-family: $ff2;
    font-size: 20px;
  }
  & .date {
    font-size: 12px;
  }
  & .rating {
    color: $C1;
    font-size: 20px;
  }
  .rating-text-wrapper{
    display: flex;
    justify-content: center;
    font-size: 10px;
    font-family: $ff2;
    color: $CB-6;
    font-weight: 600;
  }
  & .text {
    margin-top: 20px;
    font-style: italic;
    font-size: 16px;
    -webkit-line-clamp: 8;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
  }
  & .title {
    margin-top: 20px;
    font-weight: bold;
    font-size: 16px;
    -webkit-line-clamp: 8;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
  }
}
</style>
