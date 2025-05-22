import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Box,
  Flex,
  Icon,
  LinkBox,
  LinkOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { CaretDown, CaretUp, Chat } from "@phosphor-icons/react";
import { format } from "timeago.js";
import { getUserById } from "../api";
import { useAuthToken } from "../contexts/authentication";
import { MemePicture } from "./meme-picture";
import { MemeComments } from "./meme-comments";

interface MemeProps {
  meme: {
    id: string;
    authorId: string;
    pictureUrl: string;
    texts: { content: string; x: number; y: number; }[];
    description: string;
    commentsCount: number;
    createdAt: string;
  };
  isCommentsOpen: boolean;
  onCommentsToggle: () => void;
}

export const Meme: React.FC<MemeProps> = ({
  meme,
  isCommentsOpen,
  onCommentsToggle,
}) => {
  const token = useAuthToken();
  const { data: author, isLoading } = useQuery({
    queryKey: ["meme-author", meme.authorId],
    queryFn: async () => getUserById(token, meme.authorId),
  });

  if (isLoading || !author) {
    return (
      <Box p={4}>
        <Text>Loading meme...</Text>
      </Box>
    );
  }

  return (
    <VStack p={4} width="full" align="stretch">
      <Flex justifyContent="space-between" alignItems="center">
        <Flex>
          <Avatar
            borderWidth="1px"
            borderColor="gray.300"
            size="xs"
            name={author.username}
            src={author.pictureUrl}
          />
          <Text ml={2} data-testid={`meme-author-${meme.id}`}>
            {author.username}
          </Text>
        </Flex>
        <Text fontStyle="italic" color="gray.500" fontSize="small">
          {format(meme.createdAt)}
        </Text>
      </Flex>
      <MemePicture
        pictureUrl={meme.pictureUrl}
        texts={meme.texts}
        dataTestId={`meme-picture-${meme.id}`}
      />
      <Box>
        <Text fontWeight="bold" fontSize="medium" mb={2}>
          Description:{" "}
        </Text>
        <Box
          p={2}
          borderRadius={8}
          border="1px solid"
          borderColor="gray.100"
        >
          <Text
            color="gray.500"
            whiteSpace="pre-line"
            data-testid={`meme-description-${meme.id}`}
          >
            {meme.description}
          </Text>
        </Box>
      </Box>
      <LinkBox as={Box} py={2} borderBottom="1px solid black">
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center">
            <LinkOverlay
              data-testid={`meme-comments-section-${meme.id}`}
              cursor="pointer"
              onClick={onCommentsToggle}
            >
              <Text data-testid={`meme-comments-count-${meme.id}`}>
                {meme.commentsCount} comments
              </Text>
            </LinkOverlay>
            <Icon
              as={isCommentsOpen ? CaretUp : CaretDown}
              ml={2}
              mt={1}
            />
          </Flex>
          <Icon as={Chat} />
        </Flex>
      </LinkBox>
      {isCommentsOpen && (
          <MemeComments memeId={meme.id} />
      )}
    </VStack>
  );
}; 