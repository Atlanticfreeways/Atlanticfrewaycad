package main

import (
	"regexp"
)

type MerchantMapping struct {
	Pattern  *regexp.Regexp
	Name     string
	Category string
	Icon     string
	Parent   string
}

type CategoryInfo struct {
	Label string
	Group string
}

type EnrichmentResult struct {
	Name        string
	Category    string
	Group       string
	Icon        string
	ParentBrand string
}

var Merchants = []MerchantMapping{
	{regexp.MustCompile(`(?i)AMZN|AMAZON`), "Amazon", "Retail", "shopping_cart", ""},
	{regexp.MustCompile(`(?i)MSFT|MICROSOFT|AZURE|365`), "Microsoft", "Tech & Software", "computer", "Microsoft Corp"},
	{regexp.MustCompile(`(?i)GOOGLE|GSUITE|YOUTUBE`), "Google", "Tech & Software", "search", "Alphabet Inc"},
	{regexp.MustCompile(`(?i)APPLE.COM|ITUNES`), "Apple", "Tech & Electronics", "apple", "Apple Inc"},
	{regexp.MustCompile(`(?i)WMT|WAL-MART|WALMART`), "Walmart", "Essentials", "store", ""},
	{regexp.MustCompile(`(?i)COSTCO`), "Costco", "Essentials", "shopping_bag", ""},
	{regexp.MustCompile(`(?i)NFLX|NETFLIX`), "Netflix", "Entertainment", "movie", ""},
	{regexp.MustCompile(`(?i)SPOTIFY`), "Spotify", "Entertainment", "music_note", ""},
	{regexp.MustCompile(`(?i)UBER`), "Uber", "Transport", "directions_car", ""},
	{regexp.MustCompile(`(?i)LYFT`), "Lyft", "Transport", "local_taxi", ""},
	{regexp.MustCompile(`(?i)SBUX|STARBUCKS`), "Starbucks", "Dining", "local_cafe", ""},
	{regexp.MustCompile(`(?i)MCDONALDS`), "McDonalds", "Dining", "fastfood", ""},
}

var Categories = map[string]CategoryInfo{
	"5411": {"Groceries", "Essentials"},
	"5812": {"Dining", "Dining & Entertainment"},
	"5814": {"Fast Food", "Dining & Entertainment"},
	"4121": {"Taxis/Rideshare", "Transport"},
	"4814": {"Telecommunications", "Tech & Utilities"},
	"5311": {"Department Stores", "Retail"},
	"5732": {"Electronics", "Tech & Software"},
	"5968": {"Subscriptions", "Entertainment & Software"},
	"7372": {"Cloud Services", "Tech & Software"},
	"4511": {"Airlines", "Travel"},
	"7011": {"Hotels/Lodging", "Travel"},
}

func EnrichMerchant(rawName string, mcc string) EnrichmentResult {
	result := EnrichmentResult{
		Name:     rawName,
		Category: "Uncategorized",
		Group:    "Others",
		Icon:     "help_outline",
	}

	if rawName == "" {
		result.Name = "Unknown Merchant"
	}

	// 1. Identify Brand & Parent
	for _, m := range Merchants {
		if m.Pattern.MatchString(rawName) {
			result.Name = m.Name
			result.Category = m.Category
			result.Icon = m.Icon
			result.ParentBrand = m.Parent
			break
		}
	}

	// 2. Resolve Category
	if result.Category == "Uncategorized" {
		if info, ok := Categories[mcc]; ok {
			result.Category = info.Label
			result.Group = info.Group
		} else {
			result.Category = "Other"
			result.Group = "Others"
		}
	} else {
		// Try to find group for the brand category
		for _, info := range Categories {
			if info.Label == result.Category {
				result.Group = info.Group
				break
			}
		}
		if result.Group == "Others" {
			result.Group = "General"
		}
	}

	return result
}
