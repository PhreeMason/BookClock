import { ThemedScrollView } from "@/components/ThemedScrollView";
import { ThemedText } from "@/components/ThemedText";
import { useGetBookData } from "@/hooks/useBooks";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

const sampleResponse = {
  api_id: "15839976-red-rising",
  api_source: "goodreads",
  cover_image_url:
    "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1461354651i/15839976.jpg",
  description:
    '<i>"I live for the dream that my children will be born free," she says. "That they will be what they like. That they will own the land their father gave them."<br /><br />"I live for you," I say sadly.<br /><br />Eo kisses my cheek. "Then you must live for more."</i><br /><br />Darrow is a Red, a member of the lowest caste in the color-coded society of the future. Like his fellow Reds, he works all day, believing that he and his people are making the surface of Mars livable for future generations.<br /><br />Yet he spends his life willingly, knowing that his blood and sweat will one day result in a better world for his children.<br /><br />But Darrow and his kind have been betrayed. Soon he discovers that humanity already reached the surface generations ago. Vast cities and sprawling parks spread across the planet. Darrow—and Reds like him—are nothing more than slaves to a decadent ruling class.<br /><br />Inspired by a longing for justice, and driven by the memory of lost love, Darrow sacrifices everything to infiltrate the legendary Institute, a proving ground for the dominant Gold caste, where the next generation of humanity\'s overlords struggle for power. He will be forced to compete for his life and the very future of civilization against the best and most brutal of Society\'s ruling class. There, he will stop at nothing to bring down his enemies... even if it means he has to become one of them to do so.',
  edition: null,
  format: "physical",
  genres: [
    "Science Fiction",
    "Fantasy",
    "Fiction",
    "Dystopia",
    "Young Adult",
    "Audiobook",
    "Book Club",
  ],
  has_user_edits: false,
  isbn10: null,
  isbn13: "9780345539786",
  language: "English",
  metadata: {
    extraction_method: "schema",
    authors: ["Pierce Brown"],
    rating_count: 627598,
    review_count: 66758,
    awards:
      "Audie Award Audio Drama (2024), Goodreads Choice Award Debut Goodreads Author &amp; Nominee for Young Adult Fantasy &amp; Science Fiction (2014) and Nominee for Best of the Best  (2018), Gateway Readers Award (2017), Premio El Templo de las Mil Puertas Mejor novela extranjera perteneciente a saga (2014)",
    series: "Red Rising Saga",
  },
  publication_date: "2014-01-28T00:00:00.000Z",
  publisher: null,
  rating: 4.27,
  source: "goodreads",
  title: "Red Rising",
  total_duration: null,
  total_pages: 382,
};

const BookDisplayScreen = () => {
  const { api_id } = useLocalSearchParams();
  const { data, isLoading, error } = useGetBookData(api_id as string);

  console.log({ data, error, isLoading });
  return (
    <ThemedScrollView>
      <ThemedText>BookDisplayScreen</ThemedText>
    </ThemedScrollView>
  );
};

export default BookDisplayScreen;

const styles = StyleSheet.create({});
