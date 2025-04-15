import { useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { ClipLoader } from 'react-spinners'; // ←★追加！

const GET_STREAM_QUEUE = gql`
  query StreamQueue($slug: String!) {
    tournament(slug: $slug) {
      streamQueue {
        stream {
          streamName
        }
        sets {
          id
          fullRoundText
          slots {
            entrant {
              name
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
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
        <ClipLoader color="#36d7b7" size={60} />
      </div>
    );
  }

  if (error) return <p>エラーが発生しました: {error.message}</p>;

  const queue = data?.tournament?.streamQueue || [];

  return (
    <div style={{ padding: '2rem' }}>
      <h2>配信キュー - {slug}</h2>
      {queue.length === 0 && <p>ストリームキューは見つかりませんでした。</p>}

      {queue.map((q, i) => (
        <div key={i} style={{ marginBottom: '2rem' }}>
          <h3>Stream: {q.stream?.streamName || '不明'}</h3>
          <ul>
            {q.sets.map((set) => (
              <li key={set.id}>
                <strong>{set.fullRoundText}</strong>:{" "}
                {set.slots.map((s) => s.entrant?.name || '???').join(' vs ')}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default Matches;
