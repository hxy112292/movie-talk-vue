<template>
  <div class="discover">
    <el-row>
      <el-col :span="6" :offset="17">
        <search-bar></search-bar>
      </el-col>
    </el-row>
    <el-row>
      <p style="text-align: center;font-size: 30px">Discover Movie</p>
    </el-row>
    <discover-filter @change="getDiscoverList"></discover-filter>
    <el-row v-for="(discovers,indexRow) in discoverList" v-bind:key="indexRow">
      <el-col :span="4" v-for="(discover,index) in discovers"  v-bind:key="index" :offset="index%4===0?2:1" >
        <movie-card :movie-id="discover.id" :title="discover.title" :url="discover.poster_path"></movie-card>
      </el-col>
    </el-row>
    <el-row type="flex" justify="center">
      <el-pagination
        @current-change="pageChange"
        :current-page.sync="currentPage"
        :page-size="20"
        layout="prev, pager, next, jumper"
        :total="totalCount">
      </el-pagination>
    </el-row>
  </div>
</template>

<script>
import { MovieService } from '../../services/api'
import DiscoverFilter from '../../components/DiscoverFilter'
import MovieCard from '../../components/MovieCard'
import SearchBar from '../../components/SearchBar'

export default {
  name: 'Discover',
  components: {
    DiscoverFilter,
    MovieCard,
    SearchBar
  },
  data () {
    return {
      movieSearchInput: '',
      discoverList: [],
      discoverFilter: {
        year: '',
        genre: '',
        sort: ''
      },
      totalCount: 0,
      currentPage: 1
    }
  },
  mounted () {
    this.discoverFilter.year = this.$route.query.year
    this.discoverFilter.genre = this.$route.query.genre
    this.discoverFilter.sort = this.$route.query.sort
    this.getDiscoverList()
  },
  methods: {
    getDiscoverList (discoverFilter) {
      MovieService.getDiscover(discoverFilter || this.discoverFilter, this.currentPage).then(
        result => {
          this.totalCount = result.total_results
          // long list reduce to two-dimensional array
          this.discoverList = result.results.reduce((pre, next, idx) => {
            const inner = pre[~~(idx / 4)]
            if (inner !== undefined) {
              inner.push(next)
            } else {
              pre.push([next])
            }
            return pre
          }, [[]])
        }
      )
    },
    toMovie () {
      this.$router.push({ path: '/movie' })
    },
    pageChange (page) {
      this.currentPage = page
      this.getDiscoverList()
    }
  }
}
</script>

<style scoped>
</style>
