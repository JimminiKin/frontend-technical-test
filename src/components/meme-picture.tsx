import { Box, Text, useDimensions } from "@chakra-ui/react";
import { useMemo, useRef } from "react";
import { motion, PanInfo } from "framer-motion";

export type MemePictureProps = {
  pictureUrl: string;
  texts: {
    content: string;
    x: number;
    y: number;
  }[];
  dataTestId?: string;
  onDragEnd?: (index: number, x: number, y: number) => void;
  isEditable?: boolean;
};

const REF_WIDTH = 800;
const REF_HEIGHT = 450;
const REF_FONT_SIZE = 36;

const MotionText = motion(Text);

type MemeTextProps = {
  text: {
    content: string;
    x: number;
    y: number;
  };
  index: number;
  fontSize: number;
  dataTestId: string;
};

const MemeText: React.FC<MemeTextProps> = ({ text, fontSize, dataTestId, index}) => {
  return (
    <Text
      position="absolute"
      top={text.y}
      left={text.x}
      fontSize={fontSize}
      color="white"
      fontFamily="Impact"
      fontWeight="bold"
      userSelect="none"
      textTransform="uppercase"
      style={{
        WebkitTextStroke: "2px black",
      }}
      data-testid={`${dataTestId}-text-${index}`}
    >
      {text.content}
    </Text>
  );
};

type EditableMemeTextProps = {
  text: {
    content: string;
    x: number;
    y: number;
  };
  index: number;
  fontSize: number;
  isEditable: boolean;
  dataTestId: string;
  constraintsRef: React.RefObject<HTMLDivElement>;
  boxRatio: number;
  onDragEnd?: (index: number, x: number, y: number) => void;
};

const EditableMemeText: React.FC<EditableMemeTextProps> = ({
  text,
  index,
  fontSize,
  dataTestId,
  constraintsRef,
  boxRatio,
  onDragEnd,
}) => {
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!onDragEnd) return;

      const newRealX = (text.x + info.offset.x) ;
      const newRefX =  newRealX / boxRatio;
      const newCappedRefX = Math.max(0, Math.min(REF_WIDTH, newRefX));

      const newRealY = (text.y + info.offset.y) ;
      const newRefY =  newRealY / boxRatio;
      const newCappedRefY = Math.max(0, Math.min(REF_HEIGHT, newRefY));

      console.log(newCappedRefX, newCappedRefY);
      onDragEnd(index, newCappedRefX, newCappedRefY);
    };

  return (
    <MotionText
      key={index}
      position="absolute"
      top={text.y}
      left={text.x}
      fontSize={fontSize}
      color="white"
      fontFamily="Impact"
      fontWeight="bold"
      userSelect="none"
      textTransform="uppercase"
      style={{
        WebkitTextStroke: "2px black",
      }}
      data-testid={`${dataTestId}-text-${index}`}
      drag={true}
      dragElastic={0}
      dragConstraints={constraintsRef}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      cursor={"grab"}
      whileDrag={{ cursor: "grabbing", top: null, left: null }}
    >
      {text.content}
    </MotionText>
  );
};

export const MemePicture: React.FC<MemePictureProps> = ({
  pictureUrl,
  texts: rawTexts,
  dataTestId = "",
  onDragEnd,
  isEditable = false,
}) => {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const dimensions = useDimensions(constraintsRef, true);
  const boxWidth = dimensions?.borderBox.width;
  const boxRatio = boxWidth ? boxWidth / REF_WIDTH : 1;

  const { height, fontSize, texts } = useMemo(() => {
    return {
      height: boxRatio * REF_HEIGHT,
      fontSize: boxRatio * REF_FONT_SIZE,
      texts: rawTexts.map((text) => ({
        ...text,
        x: Math.floor(boxRatio * text.x),
        y: Math.floor(boxRatio * text.y),
      })),
    };
  }, [boxRatio, rawTexts]);


  return (
    <Box
      width="full"
      height={height}
      ref={constraintsRef}
      backgroundImage={pictureUrl}
      backgroundColor="gray.100"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      backgroundSize="contain"
      overflow="hidden"
      position="relative"
      borderRadius={8}
      data-testid={dataTestId}
    >
      {texts.map((text, index) =>
        isEditable ? (
          <EditableMemeText
            key={index}
            text={text}
            index={index}
            fontSize={fontSize}
            isEditable={isEditable}
            dataTestId={dataTestId}
            constraintsRef={constraintsRef}
            onDragEnd={onDragEnd}
            boxRatio={boxRatio}
          />
        ) : (
          <MemeText
            key={index}
            text={text}
            index={index}
            fontSize={fontSize}
            dataTestId={dataTestId}
          />
        )
      )}
    </Box>
  );
};
