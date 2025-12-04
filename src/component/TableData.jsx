import React, { useState, useEffect, useRef } from "react";

export default function TableData() {
  const [data, setData] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const batchSize = 5;

  const loaderRef = useRef(null);

  // Fetch all data initially
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoadingInitial(true);
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/posts"
        );
        const allData = await response.json();
        setData(allData);

        // Load first batch
        const initialBatch = allData.slice(0, batchSize);
        setDisplayedData(initialBatch);
        setCurrentIndex(batchSize);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchAllData();
  }, []);

  // Load more data
  const loadMoreData = () => {
    if (currentIndex >= data.length || loading) return;

    setLoading(true);

    // Simulate slight delay for better UX
    setTimeout(() => {
      const nextBatch = data.slice(currentIndex, currentIndex + batchSize);
      setDisplayedData((prev) => [...prev, ...nextBatch]);
      setCurrentIndex((prev) => prev + batchSize);
      setLoading(false);
    }, 500);
  };

  // Set up Intersection Observer
  useEffect(() => {
  if (!loaderRef.current || currentIndex >= data.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const first = entries[0];
      if (first.isIntersecting && !loading) {
        loadMoreData();
      }
    },
    { threshold: 0.5 }
  );

  observer.observe(loaderRef.current);

  return () => observer.disconnect();
}, [loading, currentIndex, data]);


  if (loadingInitial) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div>Loading initial data...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h3 className="mt-5 mb-3">
        Infinite Scroll Posts ({displayedData.length} of {data.length})
      </h3>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>title</th>
              <th>body</th>
            </tr>
          </thead>
          <tbody>
            {displayedData.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.title}</td>
                <td>{item.body}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Loader element */}
      <div
        ref={loaderRef}
        style={{
          textAlign: "center",
          padding: "30px",
          marginTop: "20px",
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                border: "3px solid #f3f3f3",
                borderTop: "3px solid #007bff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginRight: "10px",
              }}
            ></div>
            <span style={{ color: "#6c757d" }}>Loading more posts...</span>
          </div>
        ) : currentIndex < data.length ? (
          <div style={{ color: "#6c757d" }}>
            Scroll down to load more posts ({data.length - displayedData.length}{" "}
            remaining)
          </div>
        ) : (
          <div
            style={{
              padding: "15px",
              backgroundColor: "#d4edda",
              color: "#155724",
              borderRadius: "4px",
              border: "1px solid #c3e6cb",
            }}
          >
            <strong>All posts loaded!</strong> You've reached the end of the
            list.
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div>
        <div
          style={{
            height: "6px",
            width: `${(displayedData.length / data.length) * 100}%`,
            backgroundColor: "#007bff",
            transition: "width 0.3s ease",
          }}
        ></div>
      </div>

      <div>
        Showing {displayedData.length} of {data.length} posts (
        {Math.round((displayedData.length / data.length) * 100)}%)
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          table {
            font-size: 14px;
          }
          th, td {
            padding: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}
