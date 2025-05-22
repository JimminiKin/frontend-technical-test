import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Avatar,
  Box,
  Collapse,
  Flex,
  Icon,
  LinkBox,
  LinkOverlay,
  StackDivider,
  Text,
  VStack,
} from "@chakra-ui/react";
import { CaretDown, CaretUp, Chat } from "@phosphor-icons/react";
import { format } from "timeago.js";
import { getMemes, getUserById } from "../../api";
import { useAuthToken } from "../../contexts/authentication";
import { Loader } from "../../components/loader";
import { MemePicture } from "../../components/meme-picture";
import { MemeComments } from "../../components/meme-comments";
import { useState } from "react";

export const MemeFeedPage: React.FC = () => {
  const token = useAuthToken();
  const { isLoading, data: memes } = useQuery({
    queryKey: ["memes"],
    queryFn: async () => {
      const memes = [];
      const firstPage = await getMemes(token, 1);
      memes.push(...firstPage.results);
      const remainingPages =
        Math.ceil(firstPage.total / firstPage.pageSize) - 1;
      for (let i = 0; i < remainingPages; i++) {
        const page = await getMemes(token, i + 2);
        memes.push(...page.results);
      }
      const memesWithAuthor = [];
      for (let meme of memes) {
        const author = await getUserById(token, meme.authorId);
        memesWithAuthor.push({
          ...meme,
          author,
        });
      }
      return memesWithAuthor;
    },
  });

  const [openedCommentSection, setOpenedCommentSection] = useState<string | null>(null);

  if (isLoading) {
    return <Loader data-testid="meme-feed-loader" />;
  }

  return (
    <Flex width="full" height="full" justifyContent="center" overflowY="auto">
      <VStack
        p={4}
        width="full"
        maxWidth={800}
        divider={<StackDivider border="gray.200" />}
      >
        {memes?.map((meme) => {
          return (
            <VStack key={meme.id} p={4} width="full" align="stretch">
              <Flex justifyContent="space-between" alignItems="center">
                <Flex>
                  <Avatar
                    borderWidth="1px"
                    borderColor="gray.300"
                    size="xs"
                    name={meme.author.username}
                    src={meme.author.pictureUrl}
                  />
                  <Text ml={2} data-testid={`meme-author-${meme.id}`}>{meme.author.username}</Text>
                </Flex>
                <Text fontStyle="italic" color="gray.500" fontSize="small">
                  {format(meme.createdAt)}
                </Text>
              </Flex>
              <MemePicture pictureUrl={meme.pictureUrl} texts={meme.texts} dataTestId={`meme-picture-${meme.id}`} />
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
                  <Text color="gray.500" whiteSpace="pre-line" data-testid={`meme-description-${meme.id}`}>
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
                      onClick={() =>
                        setOpenedCommentSection(
                          openedCommentSection === meme.id ? null : meme.id,
                        )
                      }
                    >
                      <Text data-testid={`meme-comments-count-${meme.id}`}>{meme.commentsCount} comments</Text>
                    </LinkOverlay>
                    <Icon
                      as={
                        openedCommentSection !== meme.id ? CaretDown : CaretUp
                      }
                      ml={2}
                      mt={1}
                    />
                  </Flex>
                  <Icon as={Chat} />
                </Flex>
              </LinkBox>
              <Collapse in={openedCommentSection === meme.id} animateOpacity>
                <MemeComments
                  memeId={meme.id}
                />
              </Collapse>
            </VStack>
          );
        })}
      </VStack>
    </Flex>
  );
};

export const Route = createFileRoute("/_authentication/")({
  component: MemeFeedPage,
});
