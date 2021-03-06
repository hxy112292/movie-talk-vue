<template>
  <div class="movie">
    <el-container>
      <el-main>
        <el-row>
          <el-col :span="5" :offset="0">
            <movie-card :movie-id="movie.id" :title="movie.title" :url="movie.poster_path"></movie-card>
          </el-col>
          <el-col :span="10" :offset="1">
            <el-row>
              <el-table :show-header="false" :data="tableData" style="width: 100%">
                <el-table-column
                  width="120"
                  prop="key"
                  label="Key">
                </el-table-column>
                <el-table-column
                  prop="value"
                  label="Value">
                </el-table-column>
              </el-table>
            </el-row>
            <el-row>
              <p>
                <el-button type="warning" v-show="isCollect===1" icon="el-icon-star-on" @click="doCollectOrNot()">UnCollect movie</el-button>
                <el-button type="warning" v-show="isCollect===0" icon="el-icon-star-off" @click="doCollectOrNot()">Collect movie</el-button>
              </p>
            </el-row>
          </el-col>
          <el-col :span="7" :offset="1" style="font-size: 70px;text-align: center;">
            <p>
              {{movie.vote_average}}
              <el-rate
                v-model="movie.vote_average"
                disabled
                :max=10.00
                text-color="#ff9900">
              </el-rate>
            </p>
          </el-col>
        </el-row>
        <p class="title-p">
          Introduction:
        </p>
        <p>
          {{movie.overview}}
        </p>
        <p class="title-p">
          Your Voting:
        </p>
        <el-row>
          <el-col>
            <el-rate :allow-half="true" :show-score="true" :max="10" v-model="yourVoting"></el-rate>
          </el-col>
        </el-row>
        <el-row>
          <div class="write-review-div">
            <span class="title-p">
              Reviews:
            </span>
            <el-button id="write-review-btn" type="warning" @click="toWriteReview" icon="el-icon-edit" round>
              Write Review
            </el-button>
          </div>
        </el-row>
        <el-row v-for="(review,index) in reviewList" v-bind:key="index">
          <el-col :span="2">
            <user-card :uid="review.uid" :username="review.username"></user-card>
          </el-col>
          <el-col :span="20" :offset="1">
            <p class="title-p">{{review.title}}</p>
            <p>{{review.content}}</p>
            <el-row class="row-bg" justify="end">
              <el-col :span="2" :offset="14">
                <p>
                  <el-link icon="el-icon-warning" type="primary" @click="prepareReport(review.id)">Report</el-link>
                </p>
              </el-col>
              <el-col :span="2">
                <el-badge :value="review.likeTotal" class="item">
                  <el-button type="danger" size="medium" @click="doLikeOrNot(review)">{{review.isLike?'Unlike':'Like'}}</el-button>
                </el-badge>
              </el-col>
              <el-col :span="2">
                <el-button type="primary" size="medium" @click="toWriteReply(review.id,review.uid)">Reply</el-button>
              </el-col>
              <el-col :span="2">
                <el-button type="success" v-show="review.uid===user.uid" size="medium" @click="updateReview(review.id)">Update</el-button>
              </el-col>
              <el-col :span="2">
                <el-button type="info" v-show="review.uid===user.uid" size="medium" @click="deleteReview(review.id)">Delete</el-button>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
        <el-row type="flex" justify="center">
          <el-pagination
            @current-change="pageChange"
            @size-change="sizeChange"
            :current-page.sync="currentPage"
            :page-sizes="[5, 10, 20, 40]"
            :page-size="pageSize"
            layout="sizes, prev, pager, next, jumper"
            :total="totalCount">
          </el-pagination>
        </el-row>
        <report-dialog :show-dialog="showReport" @close="showReport=false" :review-id="reviewId"></report-dialog>
      </el-main>
    </el-container>
  </div>

</template>

<script>
import { MovieService, ReviewService } from '../../services/api'
import MovieCard from '../../components/MovieCard'
import UserCard from '../../components/UserCard'
import ReportDialog from '../../components/ReportDialog'

export default {
  name: 'Detail',
  components: {
    UserCard,
    MovieCard,
    ReportDialog
  },
  data () {
    return {
      tableData: [],
      currentPage: 1,
      pageSize: 5,
      totalCount: 0,
      yourVoting: 6.5,
      avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      movieId: this.$route.query.id,
      movie: {},
      reviewList: [],
      showReport: false,
      reviewId: 0,
      isCollect: 0,
      collect: {}
    }
  },
  computed: {
    user: function () {
      return this.$store.state.global.user
    }
  },
  mounted () {
    this.getMovieDetail()
    this.getMovieCredits()
    this.getReviews()
    this.getIsCollect()
  },
  methods: {
    toWriteReview () {
      this.$router.push({ path: '/review/write', query: { id: this.movie.id.toString() } })
    },
    toWriteReply (rid, uid) {
      this.$router.push({ path: '/review/reply', query: { uid: uid, rid: rid } })
    },
    prepareReport (reviewId) {
      this.reviewId = reviewId
      this.showReport = true
    },
    getMovieDetail () {
      MovieService.getDetails(this.movieId).then(
        result => {
          this.movie = result
          this.tableData.push({ key: 'Tilte', value: result.title })
          this.tableData.push({ key: 'Pubdate', value: result.release_date })
        }
      ).catch(() => {
      })
    },
    getMovieCredits () {
      MovieService.getCredits(this.movieId).then(
        result => {
          for (let item of result.crew) {
            if (item.job === 'Director') {
              this.tableData.push({ key: 'Director', value: item.name })
            }
          }
          let casts = ''
          let len = 1
          let max = 8
          for (let item of result.cast) {
            len++
            if (len < max && len < result.cast.length) {
              casts = casts + item.name + ', '
            } else {
              casts = casts + item.name
              break
            }
          }
          this.tableData.push({ key: 'Casts', value: casts })
        }
      ).catch(() => {
      })
    },
    getReviews () {
      ReviewService.getByMid(this.currentPage, this.pageSize, this.movieId).then(
        res => {
          this.totalCount = res.total
          this.reviewList = res.result
        }
      ).catch(() => {
      })
    },
    updateReview (rid) {
      this.$router.push({ path: '/review/update', query: { mid: this.movie.id.toString(), rid: rid } })
    },
    deleteReview (id) {
      ReviewService.deleteReview(id).then(
        res => {
          if (res) {
            this.$message.success('Success')
            this.getReviews()
          }
        }
      ).catch(() => {
      })
    },
    doLikeOrNot (review) {
      if (review.isLike) {
        ReviewService.deleteReviewLike(review.id).then(
          res => {
            if (res) {
              this.$message.success('Success')
              review.isLike = 0
              review.likeTotal--
            }
          }
        ).catch(() => {
        })
      } else {
        ReviewService.createReviewLike(review.id).then(
          res => {
            if (res) {
              this.$message.success('Success')
              review.isLike = 1
              review.likeTotal++
            }
          }
        ).catch(() => {
        })
      }
    },
    getIsCollect () {
      MovieService.isCollect(this.movieId).then(
        res => {
          if (res) {
            this.isCollect = 1
          } else {
            this.isCollect = 0
          }
        }
      ).catch(() => {
      })
    },
    doCollectOrNot () {
      if (this.isCollect) {
        MovieService.deleteCollect(this.movieId).then(
          res => {
            if (res) {
              this.$message.success('Success')
              this.isCollect = 0
            }
          }
        ).catch(() => {
        })
      } else {
        this.collect.mid = this.movieId
        this.collect.title = this.movie.title
        MovieService.createCollect(this.collect).then(
          res => {
            if (res) {
              this.$message.success('Success')
              this.isCollect = 1
            }
          }
        ).catch(() => {
        })
      }
    },
    pageChange (page) {
      this.currentPage = page
      this.getReviews()
    },
    sizeChange (size) {
      this.pageSize = size
      this.getReviews()
    }
  }
}
</script>

<style scoped lang="scss">
  .write-review-div {
    span {
      margin-right: 60%;
    }

    #write-review-btn {
      right: 20px;
    }

    margin-bottom: 20px;
    margin-top: 20px;
  }

  .title-p {
    text-align: left;
    font-size: 20px;
  }

  .cast-p {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4; //需要显示时文本行数
    overflow: hidden;
  }

  .el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
</style>
