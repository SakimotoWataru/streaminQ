import { useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { ClipLoader } from 'react-spinners';
import './Matches.css';

const GET_STREAM_QUEUE = gql`
  query StreamQueue($slug: String!) {
    tournament(slug: $slug) {
      name
      images {
        url
        type
      }
      streamQueue {
        stream {
          streamLogo
          streamName
          streamSource
          streamId
          isOnline
        }
        sets {
          id
          fullRoundText
          slots {
            seed {
              seedNum
            }
            entrant {
              id
              name
            }
            standing {
              stats {
                score {
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

function Matches() {
  const { slug } = useParams();
  const { loading, error, data } = useQuery(GET_STREAM_QUEUE, {
    variables: { slug },
    pollInterval: 15000,
  });

  const getStreamLogo = (source) => {
    switch (source) {
      case 'TWITCH':
        return 'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png';
      case 'YOUTUBE':
        return 'https://img.icons8.com/color/48/youtube-play.png';
      default:
        return 'https://via.placeholder.com/32?text=?';
    }
  };

  // ロード中のリング
  if (loading) {
    return (
      <div className="loader-container">
        <ClipLoader color="#36d7b7" size={60} />
      </div>
    );
  }

  if (error) return <p className="error">エラーが発生しました: {error.message}</p>;

  // 大会バナーやアイコンを取得
  const tournament = data?.tournament;
  const banner = tournament?.images?.find((img) => img.type === 'banner')?.url;
  const icon = tournament?.images?.find((img) => img.type === 'profile')?.url;

  const flatMatches = tournament?.streamQueue?.flatMap((q) =>
    q.sets.map((set) => ({
      stream: q.stream,
      set,
    }))
  ) || [];

  // ヘッダーを定義
  return (
    <div className="container">
      <header className="page-header">
        <div className="logo-title-wrapper">
          <img src="/SQlogo-edge.svg" alt="Logo" className="logo" />
        </div>
      </header>

      {banner && (
        <div className="banner-wrapper">
          <img src={banner} alt="Tournament Banner" className="banner" />
        </div>
      )}

{/* 大会名を表示 */}
<h2 className="title">
  <a
    href={`https://www.start.gg/${slug}`}
    target="_blank"
    rel="noopener noreferrer"
    className="tournament-link"
  >
    {tournament?.name}
  </a>{' '}
  - Streaming Schedule
</h2>

{/* 配信キューを表示 */}
      {flatMatches.length === 0 ? (
        <p className="no-queue">
          ストリームキューは見つかりませんでした。<br />No stream queue found.
        </p>
      ) : (
        <div className="card-grid">
          
          {flatMatches.map(({ stream, set }) => (
            <div key={set.id} className="card">
              <div className="round-text">{set.fullRoundText}</div>

              {/* 対戦カード */}
              {/* 左側プレイヤー */}
              <div className="players">
                <div className="player-box left">
                  <div className="player-name">{set.slots[0]?.entrant?.name || '???'}</div>
                  <div className="player-seed">Seed: {set.slots[0]?.seed?.seedNum ?? '-'}</div>
                </div>

                <div className="player-score">{set.slots[0]?.standing?.stats?.score?.value ?? '-'}</div>

              {/* 大会ロゴ */}
                <div className="icon-box">
                  <div className="icon-image-box">
                    {icon && (
                      <img src={icon} alt="Tournament Icon" className="tournament-icon" />
                    )}
                  </div>
                </div>
              {/* 右側プレイヤー */}
                <div className="player-score">{set.slots[1]?.standing?.stats?.score?.value ?? '-'}</div>

                <div className="player-box right">
                  <div className="player-name">{set.slots[1]?.entrant?.name || '???'}</div>
                  <div className="player-seed">Seed: {set.slots[1]?.seed?.seedNum ?? '-'}</div>
                </div>
              </div>

              {/* 配信先、ロゴ表示 */}
              {stream?.streamName && (
                <div className="stream-info">
                  <div className="stream-logo">
                    <img
                      src={getStreamLogo(stream.streamSource)}
                      alt={`${stream.streamName} Logo`}
                      className="stream-logo-img"
                    />
                  </div>
                  
                  <a
                    href={
                      stream.streamSource === 'TWITCH'
                        ? `https://twitch.tv/${stream.streamName}`
                        : stream.streamSource === 'YOUTUBE' && stream.streamId
                        ? `https://www.youtube.com/channel/${stream.streamId}`
                        : '#'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="stream-link"
                  >
                   {stream.streamName}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Matches;