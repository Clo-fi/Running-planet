import Button from "../../../../components/common/Button";
import Circle, { PositionType } from "./Circle";
import styles from "./RunningTab.module.scss";
import ArrowLeftIcon from "/public/icons/expandLeft.svg?react";
import ArrowRightIcon from "/public/icons/expandRight.svg?react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLongPress } from "use-long-press";
import { getKcal, haversineDistance } from "../../../../utils/runningUtils";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { runningKeys } from "../../../../libs/tanstack/queryKeys";
import {
  getCurrentRunningRecord,
  postRunningRecord,
} from "../../../../apis/running";
import { PostRunningRecordRequest } from "../../../../apis/running/dto";
import { CustomAlert } from "../../../../libs/sweetAlert/alert";
import { useUserStore } from '../../../../stores/userStore';

const RunningTab = () => {
  const weight = useUserStore((state) => state.user?.weight) as number;
  const [positions, setPositions] = useState<PositionType[]>([
    "LEFT",
    "CENTER",
    "RIGHT",
    "TOP"
  ]);
  const navigate = useNavigate();
  const [longClick, setLongClick] = useState<boolean>(false);
  const [isRunningMode, setIsRunningMode] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const { data: currentRecord } = useQuery({
    queryKey: runningKeys.current(),
    queryFn: () => getCurrentRunningRecord(),
  });
  const queryClient = new QueryClient();

  const { data: postRunningRecordRes, mutate: postRunningRecordMutate } =
    useMutation({
      mutationFn: (runningStatus: PostRunningRecordRequest) =>
        postRunningRecord(runningStatus),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: runningKeys.current() });
      },
    });

  useEffect(() => {
    if (!currentRecord) return;
    setTime(
      currentRecord.runTime.hour * 3600 +
      currentRecord.runTime.min * 60 +
      currentRecord.runTime.sec
    );
  }, [currentRecord]);

  const saveCurrentRecord = useCallback(
    async (isEnd: boolean) => {
      return navigator.geolocation.getCurrentPosition(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ coords: { latitude, longitude } }: any) => {
          console.log(`${latitude} ${longitude}`)
          if (!currentRecord) {
            postRunningRecordMutate({
              latitude,
              longitude,
              runTime: time,
              runDistance: 0,
              calories: 0,
              avgPace: {
                min: 0,
                sec: 0,
              },
              isEnd: isEnd,
            });
            return;
          } //처음시작 로직

          const distance = haversineDistance(
            {
              latitude: currentRecord?.latitude,
              longitude: currentRecord?.longitude,
            },
            { latitude, longitude }
          );

          if (
            distance /
            (currentRecord.runTime.hour * 3600 +
              currentRecord.runTime.min * 60 +
              currentRecord.runTime.sec) >
            100
          ) {
            //TODO 속도 빠르다고 표시, 속도제한 어느정도로 할지
            CustomAlert.fire({
              title: "속도가 너무 빨라요!",
              text: "교통수단을 이용하고 있으신가요? 직접 달리지 않으면 기록이 취소돼요.",
            });
            setIsRunningMode(false);
          }

          // if (distance === 0) return;

          postRunningRecordMutate({
            latitude,
            longitude,
            runTime: time,
            runDistance: currentRecord?.runDistance + distance,
            calories: getKcal(
              weight,
              (currentRecord?.runDistance + distance) / time / 3600,
              time
            ),
            avgPace: {
              min: Math.floor(
                time / (currentRecord?.runDistance + distance) / 60
              ),
              sec: (time / (currentRecord?.runDistance + distance)) % 60,
            },
            isEnd: isEnd,
          });
        }
      );
    },
    [currentRecord, postRunningRecordMutate, time]
  );

  const exitHandler = async () => {
    try {
      CustomAlert.fire({
        title: '정말 나가시겠습니까?',
        showCancelButton: true,
        timer: 1000
      }).then((result) => {
        if (result.isConfirmed) {
          // 확인 버튼이 눌렸을 때 이동 처리
          navigate(-1); // navigate 함수는 어딘가에서 정의된 것으로 가정
        }
      });
    } catch (err) {
      console.error(err);
    }
  }
  /* isRunningMode Check*/
  useEffect(() => {
    console.log('isRunningMode is ', isRunningMode);
  }, [isRunningMode])
  /* 주기적으로 운동 상태 저장 */
  useEffect(() => {

    const timer = setInterval(() => {
      if (!isRunningMode) return;
      console.log('saveCurrentRecord')
      saveCurrentRecord(false);
      console.log(currentRecord);
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, [isRunningMode, saveCurrentRecord]);

  /* 운동 시간 */
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isRunningMode) return;
      setTime((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isRunningMode]);

  const bind = useLongPress(
    () => {
      // if (!currentRecord) {
      //   console.log(currentRecord);
      //   CustomAlert.fire({ title: "운동 기록이 없습니다." });
      //   return;
      // }
      saveCurrentRecord(true).then(() => {
        navigate("/running-complete", {
          state: { recordId: postRunningRecordRes?.id },
        });
      });
    },
    {
      onStart: () => setLongClick(true),
      onFinish: () => setLongClick(false),
      onCancel: () => setLongClick(false),
      threshold: 1000,
    }
  );

  return (
    <>
      <section className={styles.status_section}>
        <Circle
          content={`${currentRecord?.avgPace?.min ?? 0}'${currentRecord?.avgPace?.sec ?? 0
            }''/KM`}
          position={positions[0]}
          description="평균페이스"
        />
        <Circle
          content={`${currentRecord?.calories?.toFixed(0) ?? 0}kcal`}
          position={positions[1]}
          description="칼로리"
        />
        <Circle
          content={`${currentRecord?.runDistance?.toFixed(2) ?? 0}km`}
          position={positions[2]}
          description="이동한 거리"
        />
        <Circle
          position={positions[3]}
          component={<button onClick={() => exitHandler()} >홈으로 돌아가기</button>}
        />
        <ArrowLeftIcon
          className={styles.left_btn}
          onClick={() => { setPositions((prev) => [prev[3], prev[0], prev[1], prev[2],]); }}
        />
        <ArrowRightIcon
          className={styles.right_btn}
          onClick={() => setPositions((prev) => [prev[1], prev[2], prev[3], prev[0],])}
        />
      </section>
      <section className={styles.time_section}>
        {Math.floor(time / 3600)} : {Math.floor(time / 60) % 60} : {time % 60}
      </section>
      <section className={styles.control_section}>
        <Button
          value={isRunningMode ? "정지하기" : "시작하기"}
          onClick={() => {
            setIsRunningMode((prev) => !prev);
          }}
          className={styles.button}
        />
        <Button
          value="종료하기"
          description="꾹 눌러서"
          className={`${styles.button} ${longClick ? styles.active : ""}`}
          {...bind()}
        />
      </section>
    </>
  );
};

export default RunningTab;
