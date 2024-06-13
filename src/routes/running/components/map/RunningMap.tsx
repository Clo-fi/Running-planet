import { useEffect, useRef, useState } from 'react'
import styles from './RunningMap.module.scss'
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import useGetLocation from '../../../../libs/hooks/useGetLocation';



const RunningMap = () => {
  const { myLat, myLot } = useGetLocation();

  const mapRef = useRef<kakao.maps.Map>(null);

  const [latitude, setLatitude] = useState<number>(myLat); // 초기값 설정
  const [longitude, setLongitude] = useState<number>(myLot); // 초기값 설정

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(showPosition, showError);
      } else {
        alert('브라우저에서 Geolocation이 지원되지 않습니다.');
      }
    };

    const showPosition = (position: GeolocationPosition) => {
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
      const map = mapRef.current;
      if (map) {
        map.setCenter(new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude));
      }
    };

    const showError = (error: GeolocationPositionError) => {
      alert('Geolocation 오류: ' + error.message);
    };

    getLocation();
  }, []);

  return (

    <div className={styles.map}>

      <Map
        className={styles.map}
        id='map'
        center={{
          lat: latitude,
          lng: longitude,
        }}
        zoomable={true}
        ref={mapRef}
        style={{ width: '100%', height: '100%', zIndex: '30' }}
        draggable={false}
      >
        <MapMarker
          position={{
            lat: latitude,
            lng: longitude,
          }}
        >
        </MapMarker>
      </Map>
    </div>

  );
};

export default RunningMap;
