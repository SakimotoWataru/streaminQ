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

  if (loading) {
    return (
      <div className="loader-container">
        <ClipLoader color="#36d7b7" size={60} />
      </div>
    );
  }

  if (error) return <p className="error">エラーが発生しました: {error.message}</p>;

  const tournament = data?.tournament;
  const banner = tournament?.images?.find((img) => img.type === 'banner')?.url;
  const icon = tournament?.images?.find((img) => img.type === 'profile')?.url;
  const queue = tournament?.streamQueue || [];

  return (
    <div className="container">
      <header className="page-header">
        <div className="logo-title-wrapper">
          <img src="/SQlogo.svg" alt="Logo" className="logo" />
        </div>
      </header>

      {banner && (
        <div className="banner-wrapper">
          <img src={banner} alt="Tournament Banner" className="banner" />
        </div>
      )}

      <h2 className="title">{tournament?.name} - 配信キュー</h2>

      {queue.length === 0 ? (
        <p className="no-queue">
          ストリームキューは見つかりませんでした。<br />No stream queue found.
        </p>
      ) : (
        <div className="card-grid">
          {queue.map((q, i) => (
            <div key={i} className="card">
              {q.sets.map((set) => (
                <div key={set.id} className="match-item">
                  <span className="round-text">{set.fullRoundText}</span>

                  {icon && (
                    <div className="icon-wrapper">
                      <img src={icon} alt="Tournament Icon" className="tournament-icon" />
                    </div>
                  )}

                  <div className="players-wrapper">
                    {set.slots.map((s, index) => (
                      <div key={index} className="player-info">
                        <span className="player-name">{s.entrant?.name || '???'}</span>
                        <span className="player-seed">Seed: {s.seed?.seedNum ?? '-'}</span>
                        <span className="player-score">Score: {s.standing?.stats?.score?.value ?? '-'}</span>
                      </div>
                    ))}
                  </div>

                  {q.stream?.streamName && (
                    <div className="stream-info">
                      <img
                        src={getStreamLogo(q.stream.streamSource)}
                        alt={`${q.stream.streamName} Logo`}
                        className="stream-logo-img"
                      />
                      <a
                        href={
                          q.stream.streamSource === 'TWITCH'
                            ? `https://twitch.tv/${q.stream.streamName}`
                            : q.stream.streamSource === 'YOUTUBE' && q.stream.streamId
                            ? `https://www.youtube.com/channel/${q.stream.streamId}`
                            : '#'
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="stream-link"
                      >
                        {q.stream.streamSource === 'TWITCH' && `Twitch: ${q.stream.streamName}`}
                        {q.stream.streamSource === 'YOUTUBE' && `YouTube: ${q.stream.streamName}`}
                        {!['TWITCH', 'YOUTUBE'].includes(q.stream.streamSource) && q.stream.streamName}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Matches;
