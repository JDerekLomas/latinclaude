#!/usr/bin/env python3
"""
Research Pipeline - Complete system for identifying uns-digitized and untranslated Neo-Latin works.
This is the main entry point for the Neo-Latin research project.
"""

import pandas as pd
import numpy as np
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import json

# Import all our components
from main_pipeline import LatinBibliographyPipeline
from digitization_checker import DigitizationChecker
from translation_checker import TranslationChecker
from neolatin_analyzer import NeoLatinAnalyzer

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('data/research_pipeline.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class NeoLatinResearchPipeline:
    """
    Complete pipeline for Neo-Latin research.
    Identifies uns-digitized and untranslated Neo-Latin works.
    """

    def __init__(self, config_path: str = 'config/config.yaml'):
        """
        Initialize the research pipeline.

        Args:
            config_path: Path to configuration file
        """
        self.config_path = Path(config_path)
        self.config = self._load_config()

        # Initialize components
        self.bibliography_pipeline = LatinBibliographyPipeline(config_path)
        self.digitization_checker = DigitizationChecker(self.config.get('digitization', {}))
        self.translation_checker = TranslationChecker(self.config.get('translation', {}))
        self.neo_latin_analyzer = NeoLatinAnalyzer()

        # Results storage
        self.results = {
            'pipeline_start': datetime.now(),
            'bibliography_stats': {},
            'digitization_stats': {},
            'translation_stats': {},
            'neo_latin_stats': {},
            'final_stats': {},
            'pipeline_end': None
        }

        # Output directories
        self.output_dir = Path('data/processed/research')
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def _load_config(self) -> Dict:
        """Load configuration with research-specific defaults."""
        try:
            import yaml
            with open(self.config_path, 'r') as f:
                config = yaml.safe_load(f)
        except Exception:
            config = {}

        # Add research-specific configuration
        research_config = {
            'research': {
                'focus_neo_latin': True,
                'neo_latin_start_year': 1300,
                'neo_latin_end_year': 1900,
                'min_neo_latin_score': 0.5,
                'include_uncertain': True
            },
            'digitization': {
                'requests_per_second': 2,
                'check_all_sources': True,
                'require_full_text': False,
                'count_preview_only': True
            },
            'translation': {
                'requests_per_second': 2,
                'check_known_translations': True,
                'check_google_books': True,
                'estimate_from_heuristics': True
            },
            'output': {
                'include_detailed_records': True,
                'create_summary_report': True,
                'create_csv_outputs': True,
                'create_visualizations': True
            }
        }

        # Merge with existing config
        for key, value in research_config.items():
            if key not in config:
                config[key] = value
            else:
                config[key].update(value)

        return config

    def run_complete_research(self, max_bibliography_records: int = None,
                            max_analysis_records: int = None) -> Dict:
        """
        Run the complete research pipeline.

        Args:
            max_bibliography_records: Limit bibliography collection (None for all)
            max_analysis_records: Limit analysis (None for all)

        Returns:
            Dictionary with complete research results
        """
        logger.info("Starting Neo-Latin Research Pipeline")
        logger.info("Goal: Identify uns-digitized and untranslated Neo-Latin works")

        try:
            # Phase 1: Collect Bibliographic Data
            logger.info("Phase 1: Collecting bibliographic data")
            bibliography_df = self._collect_bibliography_data(max_bibliography_records)

            # Phase 2: Analyze Neo-Latin Characteristics
            logger.info("Phase 2: Analyzing Neo-Latin characteristics")
            neo_latin_df = self._analyze_neo_latin(bibliography_df, max_analysis_records)

            # Phase 3: Check Digitization Status
            logger.info("Phase 3: Checking digitization status")
            digitization_df = self._check_digitization(neo_latin_df, max_analysis_records)

            # Phase 4: Check Translation Status
            logger.info("Phase 4: Checking translation status")
            translation_df = self._check_translations(digitization_df, max_analysis_records)

            # Phase 5: Generate Final Research Results
            logger.info("Phase 5: Generating final research results")
            final_results = self._generate_final_results(translation_df)

            # Phase 6: Create Reports and Visualizations
            logger.info("Phase 6: Creating reports and outputs")
            self._create_reports_and_outputs(final_results)

            self.results['pipeline_end'] = datetime.now()
            self.results['final_stats'] = self._calculate_final_stats(final_results)

            logger.info("Neo-Latin Research Pipeline completed successfully!")
            return final_results

        except Exception as e:
            logger.error(f"Research pipeline failed: {e}")
            raise

    def _collect_bibliography_data(self, max_records: int = None) -> pd.DataFrame:
        """Collect bibliographic data using existing pipeline."""
        # Update config for research needs
        if max_records:
            for collector in self.config['collectors']:
                self.config['collectors'][collector]['max_records'] = max_records

        # Run bibliography collection
        bibliography_df = self.bibliography_pipeline.run_pipeline()

        self.results['bibliography_stats'] = {
            'total_records': len(bibliography_df),
            'date_range': {
                'earliest': bibliography_df['publication_year'].min() if 'publication_year' in bibliography_df.columns else None,
                'latest': bibliography_df['publication_year'].max() if 'publication_year' in bibliography_df.columns else None
            },
            'catalogues': bibliography_df['source_catalogue'].nunique() if 'source_catalogue' in bibliography_df.columns else 0
        }

        logger.info(f"Collected {len(bibliography_df)} bibliographic records")
        return bibliography_df

    def _analyze_neo_latin(self, df: pd.DataFrame, max_records: int = None) -> pd.DataFrame:
        """Analyze Neo-Latin characteristics."""
        # Filter for potential Neo-Latin period first
        neo_latin_start = self.config['research']['neo_latin_start_year']
        neo_latin_end = self.config['research']['neo_latin_end_year']

        if 'publication_year' in df.columns:
            period_df = df[
                (df['publication_year'] >= neo_latin_start) &
                (df['publication_year'] <= neo_latin_end)
            ].copy()
            logger.info(f"Filtered to {len(period_df)} records in Neo-Latin period ({neo_latin_start}-{neo_latin_end})")
        else:
            period_df = df.copy()
            logger.info("No year filter available - analyzing all records")

        # Run Neo-Latin analysis
        neo_latin_df = self.neo_latin_analyzer.batch_analyze_neo_latin(period_df, max_records)

        # Filter by Neo-Latin confidence threshold
        min_score = self.config['research']['min_neo_latin_score']
        confident_neo_latin = neo_latin_df[neo_latin_df['neo_latin_score'] >= min_score]

        self.results['neo_latin_stats'] = {
            'total_analyzed': len(neo_latin_df),
            'neo_latin_identified': len(confident_neo_latin),
            'identification_rate': len(confident_neo_latin) / len(neo_latin_df) if len(neo_latin_df) > 0 else 0,
            'min_score_used': min_score
        }

        logger.info(f"Identified {len(confident_neo_latin)} confident Neo-Latin works")
        logger.info(f"Neo-Latin identification rate: {self.results['neo_latin_stats']['identification_rate']:.2%}")

        return confident_neo_latin

    def _check_digitization(self, df: pd.DataFrame, max_records: int = None) -> pd.DataFrame:
        """Check digitization status."""
        if df.empty:
            logger.warning("No Neo-Latin works to check for digitization")
            return df

        digitization_df = self.digitization_checker.batch_check_digitization(df, max_records)

        # Analyze digitization statistics
        digitization_stats = digitization_df['digitization_status'].value_counts()
        undigitized = digitization_df[digitization_df['digitization_status'] == 'not_found']
        preview_only = digitization_df[digitization_df['digitization_status'] == 'preview_only']

        self.results['digitization_stats'] = {
            'total_checked': len(digitization_df),
            'fully_digitized': len(digitization_df[digitization_df['full_text_available']]),
            'preview_available': len(digitization_df[digitization_df['preview_available']]),
            'metadata_only': len(digitization_df[digitization_df['digitization_status'] == 'metadata_only']),
            'not_found': len(undigitized),
            'preview_only': len(preview_only),
            'undigitization_rate': len(undigitized) / len(digitization_df) if len(digitization_df) > 0 else 0,
            'status_breakdown': digitization_stats.to_dict()
        }

        logger.info(f"Digitization analysis complete:")
        logger.info(f"  Fully digitized: {self.results['digitization_stats']['fully_digitized']}")
        logger.info(f"  Preview only: {self.results['digitization_stats']['preview_only']}")
        logger.info(f"  Not found: {self.results['digitization_stats']['not_found']}")
        logger.info(f"  Undigitization rate: {self.results['digitization_stats']['undigitization_rate']:.2%}")

        return digitization_df

    def _check_translations(self, df: pd.DataFrame, max_records: int = None) -> pd.DataFrame:
        """Check translation status."""
        if df.empty:
            logger.warning("No works to check for translations")
            return df

        translation_df = self.translation_checker.batch_check_translations(df, max_records)

        # Analyze translation statistics
        translation_stats = translation_df['translation_status'].value_counts()
        untranslated = translation_df[translation_df['translation_status'] == 'not_translated']

        self.results['translation_stats'] = {
            'total_checked': len(translation_df),
            'translated': len(translation_df[translation_df['translated']]),
            'not_translated': len(untranslated),
            'possibly_translated': len(translation_df[translation_df['translation_status'] == 'possibly_translated']),
            'likely_translated': len(translation_df[translation_df['translation_status'] == 'likely_translated']),
            'untranslation_rate': len(untranslated) / len(translation_df) if len(translation_df) > 0 else 0,
            'status_breakdown': translation_stats.to_dict()
        }

        logger.info(f"Translation analysis complete:")
        logger.info(f"  Translated: {self.results['translation_stats']['translated']}")
        logger.info(f"  Not translated: {self.results['translation_stats']['not_translated']}")
        logger.info(f"  Untranslation rate: {self.results['translation_stats']['untranslation_rate']:.2%}")

        return translation_df

    def _generate_final_results(self, df: pd.DataFrame) -> pd.DataFrame:
        """Generate final research results with focus on target works."""
        if df.empty:
            logger.warning("No data for final results")
            return df

        # Add research priority scoring
        df = self._add_research_priority(df)

        # Identify target research categories
        high_priority = df[df['research_priority'] >= 8]
        medium_priority = df[(df['research_priority'] >= 5) & (df['research_priority'] < 8)]
        research_targets = df[
            (df.get('digitization_status') == 'not_found') &
            (df.get('translation_status') == 'not_translated')
        ]

        final_stats = {
            'total_analyzed': len(df),
            'high_priority_research_targets': len(high_priority),
            'medium_priority_research_targets': len(medium_priority),
            'undigitized_untranslated': len(research_targets),
            'completely_missing': len(research_targets),
            'avg_research_priority': df['research_priority'].mean() if 'research_priority' in df.columns else 0,
            'digitization_gap': len(df[df.get('digitization_status') == 'not_found']) / len(df) if len(df) > 0 else 0,
            'translation_gap': len(df[df.get('translation_status') == 'not_translated']) / len(df) if len(df) > 0 else 0
        }

        logger.info("Final research results:")
        logger.info(f"  High priority research targets: {final_stats['high_priority_research_targets']}")
        logger.info(f"  Medium priority research targets: {final_stats['medium_priority_research_targets']}")
        logger.info(f"  Completely missing (undigitized + untranslated): {final_stats['completely_missing']}")
        logger.info(f"  Average research priority: {final_stats['avg_research_priority']:.1f}/10")

        return df

    def _add_research_priority(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add research priority scoring based on multiple factors."""
        df = df.copy()

        # Initialize priority score
        df['research_priority'] = 0.0

        # Factor 1: Neo-Latin confidence (30% weight)
        if 'neo_latin_score' in df.columns:
            df['research_priority'] += df['neo_latin_score'] * 3.0

        # Factor 2: Digitization status (25% weight)
        if 'digitization_status' in df.columns:
            # Higher priority for undigitized works
            digitization_scores = {
                'not_found': 2.5,
                'metadata_only': 1.5,
                'preview_only': 0.5,
                'digitized': 0.0,
                'unknown': 0.0
            }
            df['digitization_priority'] = df['digitization_status'].map(digitization_scores).fillna(0)
            df['research_priority'] += df['digitization_priority']

        # Factor 3: Translation status (25% weight)
        if 'translation_status' in df.columns:
            # Higher priority for untranslated works
            translation_scores = {
                'not_translated': 2.5,
                'possibly_translated': 1.0,
                'likely_translated': 0.5,
                'translated': 0.0,
                'unknown': 0.0
            }
            df['translation_priority'] = df['translation_status'].map(translation_scores).fillna(0)
            df['research_priority'] += df['translation_priority']

        # Factor 4: Historical importance (20% weight)
        if 'year' in df.columns:
            # Higher priority for key periods
            df['historical_importance'] = 0.0
            if df['year'].notna().any():
                # Renaissance (1400-1600) - very important
                df.loc[(df['year'] >= 1400) & (df['year'] < 1600), 'historical_importance'] = 2.0
                # Early Modern (1600-1700) - important
                df.loc[(df['year'] >= 1600) & (df['year'] < 1700), 'historical_importance'] = 1.5
                # Early Renaissance (1300-1400) - very important but rare
                df.loc[(df['year'] >= 1300) & (df['year'] < 1400), 'historical_importance'] = 2.0
            df['research_priority'] += df['historical_importance']

        # Normalize to 0-10 scale
        max_possible = 10.0
        df['research_priority'] = (df['research_priority'] / max_possible) * 10
        df['research_priority'] = df['research_priority'].clip(0, 10)

        # Add priority categories
        df['priority_category'] = 'low'
        df.loc[df['research_priority'] >= 5, 'priority_category'] = 'medium'
        df.loc[df['research_priority'] >= 8, 'priority_category'] = 'high'

        return df

    def _create_reports_and_outputs(self, df: pd.DataFrame):
        """Create comprehensive reports and outputs."""
        if not self.config['output']['create_csv_outputs']:
            return

        # Main research results CSV
        main_output = self.output_dir / 'neo_latin_research_results.csv'
        df.to_csv(main_output, index=False, encoding='utf-8-sig')
        logger.info(f"Main research results saved to {main_output}")

        # High priority targets
        high_priority = df[df['research_priority'] >= 8]
        if not high_priority.empty:
            high_priority_output = self.output_dir / 'high_priority_research_targets.csv'
            high_priority.to_csv(high_priority_output, index=False, encoding='utf-8-sig')
            logger.info(f"High priority targets saved to {high_priority_output}")

        # Completely missing works (undigitized + untranslated)
        missing_works = df[
            (df.get('digitization_status') == 'not_found') &
            (df.get('translation_status') == 'not_translated')
        ]
        if not missing_works.empty:
            missing_output = self.output_dir / 'missing_neo_latin_works.csv'
            missing_works.to_csv(missing_output, index=False, encoding='utf-8-sig')
            logger.info(f"Missing Neo-Latin works saved to {missing_output}")

        # Summary statistics
        if self.config['output']['create_summary_report']:
            self._create_summary_report(df)

    def _create_summary_report(self, df: pd.DataFrame):
        """Create comprehensive summary report."""
        report = {
            'research_metadata': {
                'pipeline_run_date': datetime.now().isoformat(),
                'research_goal': 'Identify uns-digitized and untranslated Neo-Latin works',
                'time_period': f"{self.config['research']['neo_latin_start_year']}-{self.config['research']['neo_latin_end_year']}",
                'configuration': self.config['research']
            },
            'pipeline_statistics': self.results,
            'key_findings': {
                'total_neo_latin_works_analyzed': len(df),
                'high_priority_research_targets': len(df[df['research_priority'] >= 8]),
                'completely_missing_works': len(df[
                    (df.get('digitization_status') == 'not_found') &
                    (df.get('translation_status') == 'not_translated')
                ]),
                'digitization_gap_percentage': f"{(len(df[df.get('digitization_status') == 'not_found']) / len(df) * 100):.1f}%",
                'translation_gap_percentage': f"{(len(df[df.get('translation_status') == 'not_translated']) / len(df) * 100):.1f}%",
                'average_research_priority': f"{df['research_priority'].mean():.1f}/10"
            },
            'detailed_breakdown': {
                'by_century': self._breakdown_by_century(df),
                'by_genre': self._breakdown_by_genre(df),
                'by_region': self._breakdown_by_region(df),
                'by_priority': self._breakdown_by_priority(df)
            },
            'top_research_targets': self._get_top_research_targets(df, 20),
            'recommendations': self._generate_recommendations(df)
        }

        # Save summary report
        report_file = self.output_dir / 'research_summary_report.json'
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False, default=str)

        # Create human-readable summary
        text_report = self._create_text_summary(report)
        text_file = self.output_dir / 'research_summary.txt'
        with open(text_file, 'w', encoding='utf-8') as f:
            f.write(text_report)

        logger.info(f"Summary reports saved to {report_file} and {text_file}")

    def _breakdown_by_century(self, df: pd.DataFrame) -> Dict:
        """Break down results by century."""
        if 'year' not in df.columns:
            return {}

        df_with_century = df.copy()
        df_with_century['century'] = (df_with_century['year'] - 1) // 100 + 1
        century_stats = df_with_century.groupby('century').agg({
            'research_priority': ['count', 'mean'],
            'digitization_status': lambda x: (x == 'not_found').sum(),
            'translation_status': lambda x: (x == 'not_translated').sum()
        }).round(2)

        return century_stats.to_dict()

    def _breakdown_by_genre(self, df: pd.DataFrame) -> Dict:
        """Break down results by genre."""
        if 'title_genres' not in df.columns:
            return {}

        genre_stats = df.groupby('title_genres').agg({
            'research_priority': ['count', 'mean'],
            'digitization_status': lambda x: (x == 'not_found').sum(),
            'translation_status': lambda x: (x == 'not_translated').sum()
        }).round(2)

        return genre_stats.to_dict()

    def _breakdown_by_region(self, df: pd.DataFrame) -> Dict:
        """Break down results by region."""
        if 'place' not in df.columns:
            return {}

        # Simple region extraction (could be enhanced)
        region_stats = df.groupby('place').agg({
            'research_priority': ['count', 'mean'],
            'digitization_status': lambda x: (x == 'not_found').sum(),
            'translation_status': lambda x: (x == 'not_translated').sum()
        }).round(2)

        return region_stats.head(20).to_dict()  # Top 20 places

    def _breakdown_by_priority(self, df: pd.DataFrame) -> Dict:
        """Break down results by priority category."""
        priority_stats = df.groupby('priority_category').agg({
            'research_priority': ['count', 'mean'],
            'digitization_status': lambda x: (x == 'not_found').sum(),
            'translation_status': lambda x: (x == 'not_translated').sum()
        }).round(2)

        return priority_stats.to_dict()

    def _get_top_research_targets(self, df: pd.DataFrame, top_n: int = 20) -> List[Dict]:
        """Get top research targets by priority."""
        top_targets = df.nlargest(top_n, 'research_priority')

        targets = []
        for _, row in top_targets.iterrows():
            target = {
                'title': row.get('title', ''),
                'author': row.get('author', ''),
                'year': row.get('year', ''),
                'research_priority': row.get('research_priority', 0),
                'digitization_status': row.get('digitization_status', 'unknown'),
                'translation_status': row.get('translation_status', 'unknown'),
                'neo_latin_score': row.get('neo_latin_score', 0),
                'evidence': row.get('evidence', '')
            }
            targets.append(target)

        return targets

    def _generate_recommendations(self, df: pd.DataFrame) -> List[str]:
        """Generate research recommendations based on findings."""
        recommendations = []

        # Digitization priorities
        missing_digitization = len(df[df.get('digitization_status') == 'not_found'])
        if missing_digitization > 0:
            recommendations.append(f"Digitization Priority: {missing_digitization} works ({missing_digitization/len(df)*100:.1f}%) need digitization")

        # Translation priorities
        missing_translations = len(df[df.get('translation_status') == 'not_translated'])
        if missing_translations > 0:
            recommendations.append(f"Translation Priority: {missing_translations} works ({missing_translations/len(df)*100:.1f}%) need translation")

        # Period priorities
        if 'year' in df.columns:
            century_gaps = self._analyze_century_gaps(df)
            if century_gaps:
                recommendations.extend([f"Period Priority: {gap}" for gap in century_gaps])

        # Author priorities
        if 'author' in df.columns:
            author_gaps = self._analyze_author_gaps(df)
            if author_gaps:
                recommendations.extend([f"Author Priority: {gap}" for gap in author_gaps[:5]])

        # Genre priorities
        if 'title_genres' in df.columns:
            genre_gaps = self._analyze_genre_gaps(df)
            if genre_gaps:
                recommendations.extend([f"Genre Priority: {gap}" for gap in genre_gaps[:5]])

        return recommendations

    def _analyze_century_gaps(self, df: pd.DataFrame) -> List[str]:
        """Analyze digitization/translation gaps by century."""
        gaps = []
        if 'year' not in df.columns:
            return gaps

        df['century'] = (df['year'] - 1) // 100 + 1

        for century in sorted(df['century'].unique()):
            century_data = df[df['century'] == century]
            missing_rate = len(century_data[
                (century_data.get('digitization_status') == 'not_found') |
                (century_data.get('translation_status') == 'not_translated')
            ]) / len(century_data) if len(century_data) > 0 else 0

            if missing_rate > 0.7:  # 70% or more missing
                gaps.append(f"{century}th century: {missing_rate*100:.1f}% of works missing digitization/translation")

        return gaps

    def _analyze_author_gaps(self, df: pd.DataFrame) -> List[str]:
        """Analyze gaps by major Neo-Latin authors."""
        gaps = []
        if 'author' not in df.columns:
            return gaps

        # Group by author and find those with high missing rates
        author_stats = df.groupby('author').agg({
            'research_priority': 'count',
            'digitization_status': lambda x: (x == 'not_found').sum(),
            'translation_status': lambda x: (x == 'not_translated').sum()
        })

        # Filter for authors with multiple works and high missing rates
        for author, stats in author_stats.iterrows():
            if stats['research_priority'] >= 3:  # Multiple works
                missing_rate = (stats['digitization_status'] + stats['translation_status']) / (2 * stats['research_priority'])
                if missing_rate > 0.8:  # 80% or more missing
                    gaps.append(f"{author}: {missing_rate*100:.1f}% of works missing")

        return sorted(gaps, key=lambda x: float(x.split(':')[-1].rstrip('%')), reverse=True)

    def _analyze_genre_gaps(self, df: pd.DataFrame) -> List[str]:
        """Analyze gaps by genre."""
        gaps = []
        if 'title_genres' not in df.columns:
            return gaps

        genre_stats = df.groupby('title_genres').agg({
            'research_priority': 'count',
            'digitization_status': lambda x: (x == 'not_found').sum(),
            'translation_status': lambda x: (x == 'not_translated').sum()
        })

        for genre, stats in genre_stats.iterrows():
            if stats['research_priority'] >= 5:  # Significant number of works
                missing_rate = (stats['digitization_status'] + stats['translation_status']) / (2 * stats['research_priority'])
                if missing_rate > 0.7:  # 70% or more missing
                    gaps.append(f"{genre}: {missing_rate*100:.1f}% of works missing")

        return sorted(gaps, key=lambda x: float(x.split(':')[-1].rstrip('%')), reverse=True)

    def _create_text_summary(self, report: Dict) -> str:
        """Create human-readable text summary."""
        summary = []
        summary.append("NEO-LATIN RESEARCH SUMMARY REPORT")
        summary.append("=" * 50)
        summary.append("")

        # Metadata
        metadata = report['research_metadata']
        summary.append(f"Research Date: {metadata['pipeline_run_date']}")
        summary.append(f"Research Goal: {metadata['research_goal']}")
        summary.append(f"Time Period: {metadata['time_period']}")
        summary.append("")

        # Key Findings
        summary.append("KEY FINDINGS")
        summary.append("-" * 20)
        findings = report['key_findings']
        for key, value in findings.items():
            summary.append(f"{key.replace('_', ' ').title()}: {value}")
        summary.append("")

        # Top Research Targets
        summary.append("TOP 10 RESEARCH TARGETS")
        summary.append("-" * 30)
        for i, target in enumerate(report['top_research_targets'][:10], 1):
            summary.append(f"{i}. {target['title'][:60]}... ({target['year']})")
            summary.append(f"   Author: {target['author']}")
            summary.append(f"   Priority: {target['research_priority']:.1f}/10")
            summary.append(f"   Digitization: {target['digitization_status']}")
            summary.append(f"   Translation: {target['translation_status']}")
            summary.append("")

        # Recommendations
        summary.append("RESEARCH RECOMMENDATIONS")
        summary.append("-" * 30)
        for i, rec in enumerate(report['recommendations'], 1):
            summary.append(f"{i}. {rec}")
        summary.append("")

        # Output Files
        summary.append("OUTPUT FILES GENERATED")
        summary.append("-" * 30)
        summary.append(f"• Main results: {self.output_dir}/neo_latin_research_results.csv")
        summary.append(f"• High priority targets: {self.output_dir}/high_priority_research_targets.csv")
        summary.append(f"• Missing works: {self.output_dir}/missing_neo_latin_works.csv")
        summary.append(f"• Full report: {self.output_dir}/research_summary_report.json")
        summary.append("")

        summary.append("NEXT STEPS")
        summary.append("-" * 15)
        summary.append("1. Review high-priority research targets")
        summary.append("2. Contact libraries/digitization projects for missing works")
        summary.append("3. Consider translation projects for untranslated works")
        summary.append("4. Publish findings for scholarly community")

        return "\n".join(summary)

    def _calculate_final_stats(self, df: pd.DataFrame) -> Dict:
        """Calculate final comprehensive statistics."""
        if df.empty:
            return {}

        stats = {
            'total_works_analyzed': len(df),
            'neo_latin_confidence': {
                'high': len(df[df['neo_latin_score'] >= 0.8]),
                'medium': len(df[(df['neo_latin_score'] >= 0.5) & (df['neo_latin_score'] < 0.8)]),
                'low': len(df[df['neo_latin_score'] < 0.5])
            },
            'research_priorities': {
                'high': len(df[df['research_priority'] >= 8]),
                'medium': len(df[(df['research_priority'] >= 5) & (df['research_priority'] < 8)]),
                'low': len(df[df['research_priority'] < 5])
            },
            'digital_gaps': {
                'total_missing': len(df[df['digitization_status'] == 'not_found']),
                'percentage': (len(df[df['digitization_status'] == 'not_found']) / len(df) * 100) if len(df) > 0 else 0
            },
            'translation_gaps': {
                'total_missing': len(df[df['translation_status'] == 'not_translated']),
                'percentage': (len(df[df['translation_status'] == 'not_translated']) / len(df) * 100) if len(df) > 0 else 0
            },
            'complete_gaps': {
                'total_missing': len(df[
                    (df['digitization_status'] == 'not_found') &
                    (df['translation_status'] == 'not_translated')
                ]),
                'percentage': (len(df[
                    (df['digitization_status'] == 'not_found') &
                    (df['translation_status'] == 'not_translated')
                ]) / len(df) * 100) if len(df) > 0 else 0
            }
        }

        return stats


if __name__ == "__main__":
    # Example usage
    pipeline = NeoLatinResearchPipeline()

    try:
        # Run complete research with limited records for testing
        results = pipeline.run_complete_research(
            max_bibliography_records=100,  # Limit initial data collection
            max_analysis_records=50         # Limit analysis for testing
        )

        print("Neo-Latin research pipeline completed successfully!")
        print(f"Analyzed {len(results)} works")
        print(f"Results saved to: {pipeline.output_dir}")

    except Exception as e:
        print(f"Research pipeline failed: {e}")
        logger.exception("Pipeline failed")