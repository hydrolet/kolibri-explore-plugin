<template>
  <div class="position-relative">
    <b-button
      v-if="hasMultipleSlides"
      variant="outline-primary"
      class="previous rounded-circle"
      :class="{ invisible: isFirstSlide }"
      aria-controls="carousel"
      @click="previous()"
    >
      <ChevronLeftIcon title="Previous slide" />
    </b-button>
    <div id="backgroud-block-left" :class="{ white: hasWhiteBackground }"></div>
    <div id="backgroud-block-right" :class="{ white: hasWhiteBackground }"></div>
    <b-button
      v-if="hasMultipleSlides"
      variant="outline-primary"
      class="next rounded-circle"
      :disabled="loading"
      :class="{ invisible: hideNextButton }"
      aria-controls="carousel"
      @click="next()"
    >
      <ChevronRightIcon title="Next slide" />
    </b-button>
    <b-carousel
      ref="carousel"
      v-model="slide"
      :interval="0"
      @sliding-end="onSlidingEnd"
    >
      <b-carousel-slide
        v-for="(slideNodes, index) in slides"
        :key="'slide-' + index"
      >
        <template #img>
          <b-card-group
            deck
            class="card-deck my-2"
          >
            <slot :slideNodes="slideNodes"></slot>
            <!-- eslint-disable vue/no-use-v-if-with-v-for -->
            <b-card
              v-for="n in emptyCardsNumber"
              v-if="index === slides.length - 1"
              :key="n"
              class="invisible"
            />
          </b-card-group>
        </template>
      </b-carousel-slide>
    </b-carousel>
  </div>
</template>

<script>
import _ from 'underscore';
import ChevronLeftIcon from 'vue-material-design-icons/ChevronLeft.vue';
import ChevronRightIcon from 'vue-material-design-icons/ChevronRight.vue';
import { ItemsPerSlide } from '../constants';
import responsiveMixin from './mixins/responsiveMixin';

export default {
  name: 'SlidableGrid',
  components: { ChevronLeftIcon, ChevronRightIcon },
  mixins: [responsiveMixin],
  props: {
    nodes: {
      type: Array,
      required: true,
    },
    hasMoreNodes: {
      type: Boolean,
      default: false,
    },
    hasWhiteBackground: {
      type: Boolean,
      default: false,
    },
    itemsPerSlideSmall: {
      type: Number,
      default: Math.ceil(ItemsPerSlide / 4),
    },
    itemsPerSlideMedium: {
      type: Number,
      default: Math.ceil(ItemsPerSlide / 2),
    },
    itemsPerSlideLarge: {
      type: Number,
      default: Math.ceil(ItemsPerSlide),
    },
  },
  data() {
    return {
      slide: 0,
      loading: false,
    };
  },
  computed: {
    itemsPerSlide() {
      if (this.xs) {
        return this.itemsPerSlideSmall;
      }
      if (this.sm || this.md) {
        return this.itemsPerSlideMedium;
      }
      return this.itemsPerSlideLarge;
    },
    slides() {
      return _.chunk(this.nodes, this.itemsPerSlide);
    },
    emptyCardsNumber() {
      return this.slides.length * this.itemsPerSlide - this.nodes.length;
    },
    hasMultipleSlides() {
      return this.slides.length > 1;
    },
    isFirstSlide() {
      return this.slide === 0;
    },
    isLastSlide() {
      return this.slide === this.slides.length - 1;
    },
    hideNextButton() {
      return !this.hasMoreNodes && this.isLastSlide;
    }
  },
  watch: {
    nodes() {
      this.loading = false;
    },
  },
  methods: {
    previous() {
      this.$refs.carousel.prev();
    },
    next() {
      this.$refs.carousel.next();
    },
    onSlidingEnd() {
      if (this.hasMoreNodes && this.isLastSlide) {
        this.loading = true;
        this.$emit('loadMoreNodes');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../styles.scss";

#backgroud-block-left, #backgroud-block-right {
  position: absolute;
  width: $grid-gutter-width * .5 + $circled-button-size;
  height: 100%;
  z-index: 3; // Less than buttons, more than cards.
  top: 0;
}

$gray-gradient-left: linear-gradient(90deg,
  $gray-300 0%,
  $gray-300 50%,
  rgba($gray-300, 0) 100%
);

$gray-gradient-right: linear-gradient(90deg,
  rgba($gray-300, 0) 0%,
  $gray-300 50%,
  $gray-300 100%
);

$white-gradient-left: linear-gradient(90deg,
  $white 0%,
  $white 50%,
  rgba($white, 0) 100%
);

$white-gradient-right: linear-gradient(90deg,
  rgba($white, 0) 0%,
  $white 50%,
  $white 100%
);

#backgroud-block-left {
  left: 0;
  background: $gray-gradient-left;
  &.white {
    background: $white-gradient-left;
  }
}

#backgroud-block-right {
  right: 0;
  background: $gray-gradient-right;
  &.white {
    background: $white-gradient-right;
  }
}

.btn.previous, .btn.next {
  position: absolute;
  top: 50%;
  margin-top: -$circled-button-size / 2;
  padding: 0;
  border-width: 2px;
  bottom: 0;
  width: $circled-button-size;
  height: $circled-button-size;
  z-index: 4;
}

.btn.previous {
  left: $grid-gutter-width * .5;
}

.btn.next {
  right: $grid-gutter-width * .5;
}

.carousel {
  overflow: auto;
  overflow-x: hidden;
  & ::v-deep .carousel-inner {
    padding-right: $grid-gutter-width * .5 + $circled-button-size;
    padding-left: $grid-gutter-width * .5 + $circled-button-size;
  }
}

.card-deck {
    padding-right: $grid-gutter-width * .5;
    padding-left: $grid-gutter-width * .5;
}

</style>
