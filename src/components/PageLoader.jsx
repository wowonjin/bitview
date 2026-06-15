/** lazy 라우트 로딩 중 표시 */
const PageLoader = () => (
  <div className="page-loader" role="status" aria-live="polite">
    <div className="page-loader-spinner" />
    <p>페이지를 불러오는 중...</p>
  </div>
)

export default PageLoader
